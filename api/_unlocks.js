// Métricas de acesso aos cases protegidos, guardadas no Upstash Redis (REST).
// Sem as variáveis do Redis, ou se ele falhar, nada é registrado:
// o acesso ao case nunca depende das métricas.
//
// Chaves (caseKey = passwordKey do case):
//   unlocks:<case>               hash rótulo -> desbloqueios (senha digitada)
//   unlocks_last:<case>          hash rótulo -> data do último desbloqueio
//   unlocks_views:<case>         hash rótulo -> revisitas (cookie, sem senha)
//   unlocks_log:<case>:<rótulo>  lista dos últimos acessos (JSON)
//   visit:<id>                   leitura de um acesso: sorted set com os
//                                membros pct e sec (score -1 = sem dados)
//   unlocks_cases / unlocks_logs índices (sets) para o painel não varrer
//                                o banco inteiro com KEYS

import { randomUUID } from 'node:crypto'
import { waitUntil } from '@vercel/functions'
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
const CASES_INDEX = 'unlocks_cases'
const LOGS_INDEX = 'unlocks_logs'

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

  // O aviso não segura a resposta: roda depois dela (waitUntil).
  if (kind === 'senha') waitUntil(notifyUnlock({ caseKey, label, ...context }))

  return saveAccess(caseKey, label, id, context)
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

  const log = logKey(caseKey, label)

  try {
    const results = await redis([
      ...counters,
      ['SADD', CASES_INDEX, caseKey],
      ['SADD', LOGS_INDEX, log],
      ['ZADD', visitKey(id), '-1', 'pct', '-1', 'sec'],
      ['LPUSH', log, entry],
      // entradas que vão sair da lista: a leitura delas é apagada junto
      ['LRANGE', log, String(LOG_SIZE), '-1'],
      ['LTRIM', log, '0', String(LOG_SIZE - 1)]
    ])
    const dropped = (results.at(-2)?.result || [])
      .map((raw) => {
        try {
          return JSON.parse(raw).id
        } catch {
          return null
        }
      })
      .filter(Boolean)
    if (dropped.length) await redis([['DEL', ...dropped.map(visitKey)]])
    return id
  } catch (error) {
    console.error('Falha ao registrar acesso:', error.message)
    return null
  }
}

// Leitura enviada pelo navegador: % do conteúdo protegido que passou pela
// tela e segundos com a aba visível. ZADD XX GT: só atualiza acessos que
// existem (id inventado não cria nada) e só para cima (envio atrasado com
// valor menor não sobrescreve um maior).
export async function recordProgress(id, pct, sec) {
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/.test(id)) return
  const clamp = (n, max) => Math.max(0, Math.min(max, Math.round(Number(n) || 0)))
  try {
    await redis([
      ['ZADD', visitKey(id), 'XX', 'GT', String(clamp(pct, 100)), 'pct', String(clamp(sec, MAX_VISIT_SECONDS)), 'sec']
    ])
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

// Membros dos índices. Índice vazio (dados gravados antes de ele existir):
// varre uma vez com KEYS e preenche o índice, depois nunca mais.
async function readIndex(index, pattern, toMember) {
  const [members] = (await redis([['SMEMBERS', index]])) ?? [{ result: [] }]
  if (members.result?.length) return members.result

  const [keys] = await redis([['KEYS', pattern]])
  const found = [...new Set((keys.result || []).map(toMember))]
  if (found.length) await redis([['SADD', index, ...found]])
  return found
}

// [{ caseKey, label, count, views, last }] de todos os cases.
export async function listUnlocks() {
  if (!REDIS_URL || !REDIS_TOKEN) return []
  const caseKeys = await readIndex(CASES_INDEX, 'unlocks:*', (k) => k.slice('unlocks:'.length))
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
  if (!REDIS_URL || !REDIS_TOKEN) return []
  const logKeys = await readIndex(LOGS_INDEX, 'unlocks_log:*', (k) => k)
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

  // Leitura de cada acesso; score -1 (sem envio do navegador) fica de fora,
  // para não puxar as médias para baixo.
  const withId = rows.filter((r) => r.id)
  if (withId.length) {
    const visits = await redis(withId.map((r) => ['ZRANGE', visitKey(r.id), '0', '-1', 'WITHSCORES']))
    withId.forEach((r, n) => {
      const scores = pairs(visits[n]?.result || [])
      for (const field of ['pct', 'sec']) {
        const value = Number(scores[field])
        if (field in scores && value >= 0) r[field] = value
      }
    })
  }

  return rows.sort((a, b) => String(b.at).localeCompare(String(a.at)))
}
