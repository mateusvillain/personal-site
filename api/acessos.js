import { createHash, timingSafeEqual } from 'node:crypto'
import { listUnlocks, listUnlockLog } from './_unlocks.js'

// Tabela de desbloqueios por senha. Protegida por HTTP Basic Auth:
// usuário qualquer, senha = env ADMIN_PASSWORD.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

function isAuthorized(req) {
  const header = req.headers.authorization || ''
  if (!ADMIN_PASSWORD || !header.startsWith('Basic ')) return false
  const decoded = Buffer.from(header.slice(6), 'base64').toString()
  const password = decoded.slice(decoded.indexOf(':') + 1)
  const a = createHash('sha256').update(password).digest()
  const b = createHash('sha256').update(ADMIN_PASSWORD).digest()
  return timingSafeEqual(a, b)
}

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    : '—'

export default async function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex')
  res.setHeader('Cache-Control', 'no-store')

  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="acessos"')
    return res.status(401).send('Acesso restrito')
  }

  let rows, log
  try {
    ;[rows, log] = await Promise.all([listUnlocks(), listUnlockLog()])
  } catch (error) {
    console.error(error)
    return res.status(500).send('Erro ao ler o Redis')
  }

  const body = rows.length
    ? rows
        .map(
          (r) => `<tr><td>${escape(r.caseKey)}</td><td>${escape(r.label)}</td>` +
            `<td class="n">${r.count}</td><td class="n">${r.views}</td>` +
            `<td>${escape(formatDate(r.last))}</td></tr>`
        )
        .join('')
    : '<tr><td colspan="5">Nenhum desbloqueio registrado ainda.</td></tr>'

  const place = (r) => [r.city, r.region, r.country].filter(Boolean).join(', ') || '—'
  const duration = (sec) => {
    if (typeof sec !== 'number') return '—'
    const m = Math.floor(sec / 60)
    return `${m}:${String(sec % 60).padStart(2, '0')}`
  }
  const pct = (n) => (typeof n === 'number' ? `${n}%` : '—')
  const logBody = log.length
    ? log
        .map(
          (r) =>
            `<tr><td>${escape(r.caseKey)}</td><td>${escape(r.label)}</td>` +
            `<td>${escape(formatDate(r.at))}</td><td>${escape(r.kind || 'senha')}</td>` +
            `<td>${escape((r.locale || '—').toUpperCase())}</td><td>${escape(r.device || '—')}</td>` +
            `<td>${escape(place(r))}</td><td class="n">${pct(r.pct)}</td>` +
            `<td class="n">${duration(r.sec)}</td></tr>`
        )
        .join('')
    : '<tr><td colspan="9">Nenhum acesso registrado ainda.</td></tr>'

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Acessos</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; margin: 2rem; color: #111; }
  table { border-collapse: collapse; }
  th, td { padding: .5rem 1rem; border-bottom: 1px solid #ddd; text-align: left; }
  h2 { margin-top: 2.5rem; }
  .hint { color: #666; font-size: 13px; max-width: 60rem; }
  .scroll { overflow-x: auto; }
  td { white-space: nowrap; }
  .n { text-align: right; font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
<h1>Desbloqueios por senha</h1>
<table>
<thead><tr><th>Case</th><th>Senha</th><th class="n">Desbloqueios</th><th class="n">Revisitas</th><th>Último desbloqueio</th></tr></thead>
<tbody>${body}</tbody>
</table>
<h2>Últimos acessos</h2>
<p class="hint">
  Até 50 por senha. <b>Tipo</b>: senha digitada ou revisita (voltou em até 30 min, sem senha).
  <b>Local</b>: aproximado pelo IP (VPN e redes corporativas distorcem).
  <b>Leitura</b>: quanto do conteúdo protegido passou pela tela.
  <b>Tempo</b>: aba visível, em min:s.
</p>
<div class="scroll">
<table>
<thead><tr><th>Case</th><th>Senha</th><th>Quando</th><th>Tipo</th><th>Idioma</th><th>Aparelho</th><th>Local</th><th class="n">Leitura</th><th class="n">Tempo</th></tr></thead>
<tbody>${logBody}</tbody>
</table>
</div>
</body>
</html>`)
}
