import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { sanity, blocksToSections } from './_sanity.js'

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

function readCookie(req, name) {
  const raw = req.headers.cookie || ''
  for (const part of raw.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

// Cookie malformado (encoding inválido, assinatura truncada, etc.) conta
// como "sem cookie" — nunca deve virar 500.
function hasValidUnlockCookie(req, slug, password) {
  if (!COOKIE_SECRET) return false
  const value = readCookie(req, cookieName(slug))
  if (!value) return false

  const [exp, sig] = value.split('.')
  if (!/^\d+$/.test(exp || '') || !/^[a-f0-9]{64}$/.test(sig || '')) return false
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false

  const expected = sign(slug, exp, password)
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
}

function setUnlockCookie(res, slug, password) {
  if (!COOKIE_SECRET) {
    console.warn('UNLOCK_COOKIE_SECRET não configurada — cookie de desbloqueio desativado')
    return
  }
  const exp = Math.floor(Date.now() / 1000) + UNLOCK_TTL_SECONDS
  const value = `${exp}.${sign(slug, exp, password)}`
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

  const { slug, password, locale: rawLocale } = req.body || {}
  const locale = rawLocale === 'en' ? 'en' : 'pt'

  if (typeof slug !== 'string' || !slug) {
    return res.status(400).json({ error: 'Slug não informado' })
  }

  try {
    /* =====================================================
       1. Buscar case pelo slug
    ====================================================== */
    const doc = await sanity.fetch(
      `*[_type == "caseStudy" && slug.current == $slug][0]{
        title, isPublic, requiresPassword, passwordKey, content
      }`,
      { slug }
    )

    if (!doc || !doc.isPublic) {
      return res.status(404).json({ error: 'Projeto não encontrado' })
    }

    /* =====================================================
       2. Verificar senha (por projeto) ou cookie de desbloqueio
    ====================================================== */
    if (doc.requiresPassword) {
      const expectedPassword = process.env[`PASSWORD_${doc.passwordKey}`]

      if (!expectedPassword) {
        console.error(`PASSWORD_${doc.passwordKey} não configurada`)
        return res.status(500).json({ error: 'Erro interno' })
      }

      if (password) {
        if (password !== expectedPassword) {
          return res.status(401).json({ error: 'Senha inválida' })
        }
        setUnlockCookie(res, slug, expectedPassword)
      } else if (!hasValidUnlockCookie(req, slug, expectedPassword)) {
        return res.status(401).json({ error: 'Senha inválida' })
      }
    }

    /* =====================================================
       3. Portable Text (por idioma) -> sections
    ====================================================== */
    // Aba EN tocada no Studio mas vazia persiste `en: []` — cai no PT também.
    const localized = doc.content?.[locale]
    const blocks = localized?.length ? localized : doc.content?.pt ?? []
    const sections = blocksToSections(blocks)

    return res.status(200).json({
      title: doc.title?.[locale] || doc.title?.pt || '',
      sections
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
