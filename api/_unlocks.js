// Métricas de acesso aos cases protegidos, guardadas no Upstash Redis (REST).
// Sem as variáveis do Redis, ou se ele falhar, nada é registrado:
// o acesso ao case nunca depende das métricas.
//
// Chaves (caseKey = passwordKey do case):
//   unlocks:<case>               hash rótulo -> desbloqueios (senha digitada)
//   unlocks_last:<case>          hash rótulo -> data do último desbloqueio
//   unlocks_views:<case>         hash rótulo -> revisitas (cookie, sem senha)
//   unlocks_log:<case>:<rótulo>  lista dos últimos acessos (JSON)
//   visit:<id>                   leitura de um acesso { pct, sec }

import { randomUUID } from 'node:crypto'
import { notifyUnlock } from './_notify.js'

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

// Rótulos que acessam mas não entram nas métricas (uso próprio).
const UNTRACKED_LABELS = new Set(['pessoal'])

// Últimos acessos guardados por senha (~300 bytes cada).
const LOG_SIZE = 500
// Tetos da leitura enviada pelo navegador (valores acima são cortados).
const MAX_VISIT_SECONDS = 4 * 60 * 60

const countKey = (caseKey) => `unlocks:${caseKey}`
const lastKey = (caseKey) => `unlocks_last:${caseKey}`
const viewsKey = (caseKey) => `unlocks_views:${caseKey}`
const logKey = (caseKey, label) => `unlocks_log:${caseKey}:${label}`
const visitKey = (id) => `visit:${id}`

async function redis(commands) {
  if (!REDIS_URL || !REDIS_TOKEN) return null
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(2000)
  })
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`)
  return res.json()
}

/* --- contexto do acesso -------------------------------------------------- */

// Local aproximado pelos headers de geolocalização da Vercel (por IP).
// Só cidade/estado/país — o IP nunca é guardado.
function locationFromRequest(req) {
  const read = (name) => {
    const raw = req.headers[name]
    if (typeof raw !== 'string' || !raw) return null
    try {
      return decodeURIComponent(raw).slice(0, 80)
    } catch {
      return null
    }
  }
  return {
    city: read('x-vercel-ip-city'),
    region: read('x-vercel-ip-country-region'),
    country: read('x-vercel-ip-country')
  }
}

// Tipo de aparelho pelo User-Agent (só a categoria, não o UA inteiro).
function deviceFromRequest(req) {
  const ua = String(req.headers['user-agent'] || '')
  if (!ua) return null
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return 'tablet'
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return 'celular'
  return 'computador'
}

/* --- registro ------------------------------------------------------------- */

// kind: 'senha' (senha digitada) ou 'revisita' (cookie de desbloqueio).
// Senha digitada também avisa no Discord. Devolve o id do acesso (para o
// navegador enviar a leitura) ou null.
export async function recordAccess({ caseKey, label, kind, locale, req }) {
  if (UNTRACKED_LABELS.has(label)) return null

  const id = randomUUID()
  const at = new Date().toISOString()
  const context = { at, kind, locale, device: deviceFromRequest(req), ...locationFromRequest(req) }

  const [visitId] = await Promise.all([
    saveAccess(caseKey, label, id, context),
    kind === 'senha' ? notifyUnlock({ caseKey, label, ...context }) : null
  ])
  return visitId
}

async function saveAccess(caseKey, label, id, context) {
  if (!REDIS_URL || !REDIS_TOKEN) return null
  const { at, kind } = context
  const entry = JSON.stringify({ id, ...context })

  const counters =
    kind === 'senha'
      ? [
          ['HINCRBY', countKey(caseKey), label, '1'],
          ['HSET', lastKey(caseKey), label, at]
        ]
      : [['HINCRBY', viewsKey(caseKey), label, '1']]

  try {
    await redis([
      ...counters,
      ['LPUSH', logKey(caseKey, label), entry],
      ['LTRIM', logKey(caseKey, label), '0', String(LOG_SIZE - 1)],
      ['SET', visitKey(id), JSON.stringify({ pct: 0, sec: 0 })]
    ])
    return id
  } catch (error) {
    console.error('Falha ao registrar acesso:', error.message)
    return null
  }
}

// Leitura enviada pelo navegador: % do conteúdo protegido que passou pela
// tela e segundos com a aba visível. Só atualiza acessos que existem (XX):
// um id inventado não cria chave nova.
export async function recordProgress(id, pct, sec) {
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id)) return
  const clamp = (n, max) => Math.max(0, Math.min(max, Math.round(Number(n) || 0)))
  const value = JSON.stringify({ pct: clamp(pct, 100), sec: clamp(sec, MAX_VISIT_SECONDS) })
  try {
    await redis([['SET', visitKey(id), value, 'XX']])
  } catch (error) {
    console.error('Falha ao registrar leitura:', error.message)
  }
}

/* --- leitura (página /api/acessos/) -------------------------------------- */

const pairs = (flat = []) => {
  const out = {}
  for (let i = 0; i < flat.length; i += 2) out[flat[i]] = flat[i + 1]
  return out
}

// [{ caseKey, label, count, views, last }] de todos os cases.
export async function listUnlocks() {
  const [unlockKeys, viewKeys] = (await redis([
    ['KEYS', 'unlocks:*'],
    ['KEYS', 'unlocks_views:*']
  ])) ?? [{ result: [] }, { result: [] }]

  const caseKeys = [
    ...new Set([
      ...(unlockKeys.result || []).map((k) => k.slice('unlocks:'.length)),
      ...(viewKeys.result || []).map((k) => k.slice('unlocks_views:'.length))
    ])
  ]
  if (!caseKeys.length) return []

  const results = await redis(
    caseKeys.flatMap((c) => [
      ['HGETALL', countKey(c)],
      ['HGETALL', lastKey(c)],
      ['HGETALL', viewsKey(c)]
    ])
  )

  const rows = []
  caseKeys.forEach((caseKey, i) => {
    const counts = pairs(results[i * 3].result)
    const lasts = pairs(results[i * 3 + 1].result)
    const views = pairs(results[i * 3 + 2].result)
    const labels = new Set([...Object.keys(counts), ...Object.keys(views)])
    for (const label of labels) {
      rows.push({
        caseKey,
        label,
        count: Number(counts[label] || 0),
        views: Number(views[label] || 0),
        last: lasts[label] || null
      })
    }
  })
  return rows.sort((a, b) => a.caseKey.localeCompare(b.caseKey) || b.count - a.count)
}

// Últimos acessos com contexto e leitura, mais recentes primeiro.
export async function listUnlockLog() {
  const [keys] = (await redis([['KEYS', 'unlocks_log:*']])) ?? [{ result: [] }]
  const logKeys = keys.result || []
  if (!logKeys.length) return []

  const results = await redis(logKeys.map((k) => ['LRANGE', k, '0', '-1']))

  const rows = []
  logKeys.forEach((key, i) => {
    const [, caseKey, label] = key.split(':')
    for (const raw of results[i].result || []) {
      try {
        rows.push({ caseKey, label, ...JSON.parse(raw) })
      } catch {
        // entrada corrompida: ignora
      }
    }
  })

  const ids = rows.filter((r) => r.id).map((r) => r.id)
  if (ids.length) {
    const [visits] = await redis([['MGET', ...ids.map(visitKey)]])
    const byId = {}
    ids.forEach((id, n) => {
      try {
        if (visits.result[n]) byId[id] = JSON.parse(visits.result[n])
      } catch {
        // leitura corrompida: ignora
      }
    })
    rows.forEach((r) => {
      if (r.id && byId[r.id]) Object.assign(r, byId[r.id])
    })
  }

  return rows.sort((a, b) => String(b.at).localeCompare(String(a.at)))
}
