import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { sanity, blocksToSections } from './_sanity.js'
import { safeEqual } from './_shared.js'
import { recordAccess, recordProgress } from './_unlocks.js'

// Por quanto tempo o desbloqueio vale sem pedir a senha de novo
// (refresh, troca de idioma). Cookie HttpOnly assinado — a senha em si
// nunca vai pro browser.
const UNLOCK_TTL_SECONDS = 30 * 60

// Segredo aleatório do servidor. Sem ele o cookie de desbloqueio fica
// desativado (a senha é pedida a cada carregamento) em vez de assinar
// com algo previsível.
const COOKIE_SECRET = process.env.UNLOCK_COOKIE_SECRET

function cookieName(slug) {
  return `case_unlock_${slug.replace(/[^a-z0-9]/gi, '_')}`
}

// Chave = hash(segredo + senha do case): um cookie capturado não permite
// brute-force offline da senha (o segredo tem 256 bits de entropia), e
// trocar a senha continua invalidando os cookies antigos.
function sign(slug, exp, password) {
  const key = createHash('sha256').update(`${COOKIE_SECRET}:${password}`).digest()
  return createHmac('sha256', key).update(`${slug}:${exp}`).digest('hex')
}

// Senhas do case: PASSWORDS_<passwordKey> = JSON { rótulo: senha }.
// Cai em PASSWORD_<passwordKey> (senha única, rótulo "padrao") se não houver.
// Devolve Map rótulo -> senha.
function getPasswords(passwordKey) {
  const many = process.env[`PASSWORDS_${passwordKey}`]
  if (many) {
    try {
      const parsed = JSON.parse(many)
      return new Map(
        Object.entries(parsed).filter(
          ([label, pw]) => /^[a-z0-9-]+$/.test(label) && typeof pw === 'string' && pw
        )
      )
    } catch {
      console.error(`PASSWORDS_${passwordKey} não é um JSON válido`)
      return new Map()
    }
  }
  const single = process.env[`PASSWORD_${passwordKey}`]
  return new Map(single ? [['padrao', single]] : [])
}

// [rótulo, senha] da senha digitada, ou null. Compara com todas (sem
// parar no acerto) para o tempo não indicar a posição da senha.
function findPassword(passwords, password) {
  let found = null
  for (const entry of passwords) {
    if (safeEqual(password, entry[1]) && !found) found = entry
  }
  return found
}

function readCookie(req, name) {
  const raw = req.headers.cookie || ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

// Cookie = exp.rótulo.assinatura, assinado com a senha daquele rótulo:
// remover/trocar uma senha invalida só os cookies dela.
// Cookie malformado (encoding inválido, assinatura truncada, etc.) conta
// como "sem cookie" — nunca deve virar 500.
// Devolve o rótulo do cookie válido, ou null.
function unlockCookieLabel(req, slug, passwords) {
  if (!COOKIE_SECRET) return null
  const value = readCookie(req, cookieName(slug))
  if (!value) return null

  const [exp, label, sig] = value.split('.')
  if (!/^\d+$/.test(exp || '') || !/^[a-f0-9]{64}$/.test(sig || '')) return null
  if (Number(exp) < Math.floor(Date.now() / 1000)) return null

  const password = passwords.get(label)
  if (!password) return null

  const expected = sign(slug, `${exp}.${label}`, password)
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? label : null
}

function setUnlockCookie(res, slug, label, password) {
  if (!COOKIE_SECRET) {
    console.warn('UNLOCK_COOKIE_SECRET não configurada — cookie de desbloqueio desativado')
    return
  }
  const exp = Math.floor(Date.now() / 1000) + UNLOCK_TTL_SECONDS
  const value = `${exp}.${label}.${sign(slug, `${exp}.${label}`, password)}`
  const secure = process.env.VERCEL_ENV ? '; Secure' : ''

  res.setHeader(
    'Set-Cookie',
    `${cookieName(slug)}=${value}; Path=/; Max-Age=${UNLOCK_TTL_SECONDS}; HttpOnly; SameSite=Lax${secure}`
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { slug, password, locale: rawLocale, action } = req.body || {}
  const locale = rawLocale === 'en' ? 'en' : 'pt'

  // Leitura do conteúdo (% e tempo), enviada pelo navegador via sendBeacon.
  if (action === 'progress') {
    const { visitId, pct, sec } = req.body
    await recordProgress(visitId, pct, sec)
    return res.status(204).end()
  }

  if (typeof slug !== 'string' || !slug) {
    return res.status(400).json({ error: 'Slug não informado' })
  }

  try {
    /* =====================================================
       1. Buscar case pelo slug
    ====================================================== */
    // So os metadados aqui: o conteudo vem depois de a senha conferir.
    const doc = await sanity.fetch(
      `*[_type == "caseStudy" && slug.current == $slug][0]{
        _id, title, isPublic, requiresPassword, passwordKey
      }`,
      { slug }
    )

    if (!doc || !doc.isPublic) {
      return res.status(404).json({ error: 'Projeto não encontrado' })
    }

    /* =====================================================
       2. Verificar senha (por projeto) ou cookie de desbloqueio
    ====================================================== */
    let access = null // { label, kind } quando o case é protegido
    if (doc.requiresPassword) {
      const passwords = getPasswords(doc.passwordKey)

      if (!passwords.size) {
        console.error(`PASSWORDS_${doc.passwordKey} não configurada`)
        return res.status(500).json({ error: 'Erro interno' })
      }

      if (password) {
        const match = typeof password === 'string' ? findPassword(passwords, password) : null
        if (!match) {
          return res.status(401).json({ error: 'Senha inválida' })
        }
        const [label, labelPassword] = match
        setUnlockCookie(res, slug, label, labelPassword)
        access = { label, kind: 'senha' }
      } else {
        const label = unlockCookieLabel(req, slug, passwords)
        if (!label) {
          return res.status(401).json({ error: 'Senha inválida' })
        }
        access = { label, kind: 'revisita' }
      }
    }

    /* =====================================================
       3. Portable Text (por idioma) -> sections
    ====================================================== */
    // So o idioma pedido; aba EN tocada no Studio mas vazia persiste
    // `en: []` e cai no PT tambem. `locale` e sempre 'pt' ou 'en'.
    // Registro do acesso em paralelo com a busca do conteúdo.
    const visitIdPromise = access
      ? recordAccess({ caseKey: doc.passwordKey, ...access, locale, req })
      : Promise.resolve(null)

    const blocks = await sanity.fetch(
      `*[_id == $id][0]{
        "blocks": select(count(content.${locale}) > 0 => content.${locale}, content.pt)[]{
          ...,
          _type == "tokenMapRef" => { "map": map->{ caption, groups } },
          _type == "typeScaleRef" => { "scale": scale->{ caption, sample, rootFontSize, styles } }
        }
      }.blocks`,
      { id: doc._id }
    ) ?? []
    const sections = blocksToSections(blocks, locale)
    const visitId = await visitIdPromise

    return res.status(200).json({
      title: doc.title?.[locale] || doc.title?.pt || '',
      sections,
      ...(visitId && { visitId })
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
