// Contagem de desbloqueios por senha, guardada no Upstash Redis (REST).
// Sem as variáveis do Redis, ou se ele falhar, a contagem é ignorada:
// o desbloqueio do case nunca depende do contador.

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

// Rótulos que desbloqueiam mas não entram na contagem (uso próprio).
const UNTRACKED_LABELS = new Set(['pessoal'])

const countKey = (caseKey) => `unlocks:${caseKey}`
const lastKey = (caseKey) => `unlocks_last:${caseKey}`

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

export async function recordUnlock(caseKey, label) {
  if (UNTRACKED_LABELS.has(label)) return
  try {
    await redis([
      ['HINCRBY', countKey(caseKey), label, '1'],
      ['HSET', lastKey(caseKey), label, new Date().toISOString()]
    ])
  } catch (error) {
    console.error('Falha ao registrar desbloqueio:', error.message)
  }
}

// [{ caseKey, label, count, last }] de todos os cases.
export async function listUnlocks() {
  const [keys] = (await redis([['KEYS', 'unlocks:*']])) ?? [{ result: [] }]
  const caseKeys = (keys.result || []).map((k) => k.slice('unlocks:'.length))
  if (!caseKeys.length) return []

  const results = await redis(
    caseKeys.flatMap((c) => [['HGETALL', countKey(c)], ['HGETALL', lastKey(c)]])
  )

  const rows = []
  caseKeys.forEach((caseKey, i) => {
    const counts = results[i * 2].result || []
    const lasts = results[i * 2 + 1].result || []
    const lastByLabel = {}
    for (let j = 0; j < lasts.length; j += 2) lastByLabel[lasts[j]] = lasts[j + 1]
    for (let j = 0; j < counts.length; j += 2) {
      rows.push({
        caseKey,
        label: counts[j],
        count: Number(counts[j + 1]),
        last: lastByLabel[counts[j]] || null
      })
    }
  })
  return rows.sort((a, b) => a.caseKey.localeCompare(b.caseKey) || b.count - a.count)
}
