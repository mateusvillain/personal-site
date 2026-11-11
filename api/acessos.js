import { listUnlocks, listUnlockLog } from './_unlocks.js'
import { safeEqual, DEVICE_ICON, DEFAULT_DEVICE_ICON } from './_shared.js'

// Painel de acessos aos cases protegidos. HTTP Basic Auth:
// usuário qualquer, senha = env ADMIN_PASSWORD.
// ?origem=<rótulo> filtra por origem (rótulo da senha).
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const TZ = 'America/Sao_Paulo'

function isAuthorized(req) {
  const header = req.headers.authorization || ''
  if (!ADMIN_PASSWORD || !header.startsWith('Basic ')) return false
  const decoded = Buffer.from(header.slice(6), 'base64').toString()
  return safeEqual(decoded.slice(decoded.indexOf(':') + 1), ADMIN_PASSWORD)
}

/* --- formatação ----------------------------------------------------------- */

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

const fullDate = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: TZ, dateStyle: 'short', timeStyle: 'short' }) : ''

const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
function relative(iso) {
  if (!iso) return '—'
  const diff = (new Date(iso) - Date.now()) / 1000
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ]
  for (const [unit, size] of units) {
    if (Math.abs(diff) >= size) return rtf.format(Math.round(diff / size), unit)
  }
  return 'agora'
}

const duration = (sec) => {
  if (typeof sec !== 'number') return '—'
  const m = Math.floor(sec / 60)
  return `${m}:${String(Math.round(sec % 60)).padStart(2, '0')}`
}

// Código de país (BR) -> bandeira (🇧🇷).
const flag = (cc) =>
  /^[A-Z]{2}$/.test(cc || '')
    ? String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0)))
    : ''

const average = (nums) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null)

function bar(pct) {
  if (typeof pct !== 'number') return '<span class="muted">—</span>'
  return `<span class="reading" title="${pct}% do conteúdo passou pela tela">` +
    `<span class="bar"><span class="bar__fill" style="width:${pct}%"></span></span>` +
    `<span class="num">${pct}%</span></span>`
}

/* --- página ---------------------------------------------------------------- */

export default async function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex')
  res.setHeader('Cache-Control', 'no-store')

  if (!isAuthorized(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="acessos"')
    return res.status(401).send('Acesso restrito')
  }

  let totals, log
  try {
    ;[totals, log] = await Promise.all([listUnlocks(), listUnlockLog()])
  } catch (error) {
    console.error(error)
    return res.status(500).send('Erro ao ler o Redis')
  }

  const rawFilter = req.query?.origem ?? new URL(req.url || '/', 'http://x').searchParams.get('origem')
  const filter = /^[a-z0-9-]+$/.test(rawFilter || '') ? rawFilter : null

  // Médias de leitura/tempo vêm dos acessos guardados (até 500 por origem).
  const cards = totals.map((t) => {
    const entries = log.filter((e) => e.caseKey === t.caseKey && e.label === t.label)
    const pcts = entries.filter((e) => typeof e.pct === 'number').map((e) => e.pct)
    const secs = entries.filter((e) => typeof e.sec === 'number').map((e) => e.sec)
    return {
      ...t,
      avgPct: average(pcts),
      avgSec: average(secs),
      lastAccess: entries[0]?.at || t.last
    }
  })

  const labels = [...new Set(totals.map((t) => t.label))].sort()
  const visibleCards = filter ? cards.filter((c) => c.label === filter) : cards
  const visibleLog = filter ? log.filter((e) => e.label === filter) : log

  const chips = labels.length > 1
    ? `<nav class="chips" aria-label="Filtrar por origem">` +
      `<a href="?" class="chip${filter ? '' : ' is-active'}">Todas</a>` +
      labels
        .map((l) => `<a href="?origem=${esc(l)}" class="chip${filter === l ? ' is-active' : ''}">${esc(l)}</a>`)
        .join('') +
      `</nav>`
    : ''

  const cardsHtml = visibleCards.length
    ? visibleCards
        .map(
          (c) => `
      <article class="card">
        <header class="card__head">
          <h3>${esc(c.label)}</h3>
          <span class="tag">${esc(c.caseKey)}</span>
        </header>
        <dl class="stats">
          <div><dt>Desbloqueios</dt><dd>${c.count}</dd></div>
          <div><dt>Revisitas</dt><dd>${c.views}</dd></div>
          <div><dt>Leitura média</dt><dd>${c.avgPct === null ? '—' : `${Math.round(c.avgPct)}%`}</dd></div>
          <div><dt>Tempo médio</dt><dd>${c.avgSec === null ? '—' : duration(Math.round(c.avgSec))}</dd></div>
        </dl>
        <p class="card__foot" title="${esc(fullDate(c.lastAccess))}">Último acesso ${esc(relative(c.lastAccess))}</p>
      </article>`
        )
        .join('')
    : '<p class="empty">Nenhum desbloqueio registrado ainda.</p>'

  const rowsHtml = visibleLog
    .map((e) => {
      const place = [e.city, e.region, e.country].filter(Boolean).join(', ')
      const kind = e.kind || 'senha'
      return `
      <tr>
        <td data-label="Quando"><time datetime="${esc(e.at)}" title="${esc(fullDate(e.at))}">${esc(relative(e.at))}</time></td>
        <td data-label="Origem"><b>${esc(e.label)}</b> <span class="muted">${esc(e.caseKey)}</span></td>
        <td data-label="Tipo"><span class="badge badge--${kind === 'senha' ? 'unlock' : 'revisit'}">${kind === 'senha' ? '🔓 senha' : '↻ revisita'}</span></td>
        <td data-label="Local">${place ? `${flag(e.country)} ${esc(place)}` : '<span class="muted">—</span>'}</td>
        <td data-label="Aparelho">${e.device ? `${DEVICE_ICON[e.device] || DEFAULT_DEVICE_ICON} ${esc(e.device)}` : '<span class="muted">—</span>'}</td>
        <td data-label="Idioma">${e.locale ? esc(e.locale.toUpperCase()) : '<span class="muted">—</span>'}</td>
        <td data-label="Leitura">${bar(e.pct)}</td>
        <td data-label="Tempo" class="num">${duration(e.sec)}</td>
      </tr>`
    })
    .join('')

  const logHtml = visibleLog.length
    ? `<table class="log">
        <thead><tr><th>Quando</th><th>Origem</th><th>Tipo</th><th>Local</th><th>Aparelho</th><th>Idioma</th><th>Leitura</th><th class="num">Tempo</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`
    : '<p class="empty">Nenhum acesso registrado ainda.</p>'

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  return res.status(200).send(`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Acessos aos cases</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f7f7f5; --surface: #fff; --text: #16161a; --muted: #6b6b76;
    --line: #e6e6e2; --accent: #2f5bea; --accent-soft: #e8eefe;
    --green: #127a3d; --green-soft: #e3f4e9; --amber: #8a5a00; --amber-soft: #fbf0d9;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111114; --surface: #1a1a1f; --text: #ececf1; --muted: #9a9aa6;
      --line: #2a2a31; --accent: #7c9bff; --accent-soft: #1f2a4d;
      --green: #6fd69a; --green-soft: #173523; --amber: #f0c36b; --amber-soft: #3a2e14;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 15px/1.5 ui-sans-serif, system-ui, -apple-system, sans-serif;
  }
  main { max-width: 1100px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  h1 { font-size: 1.75rem; letter-spacing: -.02em; margin: 0; }
  h2 { font-size: 1rem; margin: 2.5rem 0 1rem; }
  .sub { color: var(--muted); margin: .25rem 0 1.5rem; }
  .muted { color: var(--muted); }
  .num { font-variant-numeric: tabular-nums; text-align: right; }

  .chips { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1.5rem; }
  .chip {
    padding: .3rem .8rem; border: 1px solid var(--line); border-radius: 999px;
    color: var(--text); text-decoration: none; background: var(--surface); font-size: .875rem;
  }
  .chip:hover { border-color: var(--accent); }
  .chip.is-active { background: var(--accent); border-color: var(--accent); color: #fff; }

  .cards { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
  .card { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 1.25rem; }
  .card__head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
  .card__head h3 { margin: 0; font-size: 1.15rem; }
  .tag { font-size: .75rem; color: var(--muted); border: 1px solid var(--line); border-radius: 6px; padding: .1rem .45rem; }
  .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.25rem 0; }
  .stats dt { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .stats dd { margin: .15rem 0 0; font-size: 1.5rem; font-weight: 600; font-variant-numeric: tabular-nums; }
  .card__foot { margin: 0; padding-top: .9rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .875rem; }

  .log { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
  .log th { text-align: left; font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; font-weight: 500; }
  .log th, .log td { padding: .7rem 1rem; border-bottom: 1px solid var(--line); white-space: nowrap; }
  .log tbody tr:last-child td { border-bottom: 0; }
  .log tbody tr:hover { background: var(--bg); }

  .badge { font-size: .8rem; padding: .15rem .55rem; border-radius: 999px; }
  .badge--unlock { background: var(--green-soft); color: var(--green); }
  .badge--revisit { background: var(--amber-soft); color: var(--amber); }

  .reading { display: inline-flex; align-items: center; gap: .6rem; }
  .bar { width: 80px; height: 6px; border-radius: 999px; background: var(--line); overflow: hidden; }
  .bar__fill { display: block; height: 100%; background: var(--accent); border-radius: inherit; }
  .reading .num { min-width: 4ch; }

  .empty { color: var(--muted); background: var(--surface); border: 1px dashed var(--line); border-radius: 14px; padding: 1.5rem; text-align: center; }
  .note { color: var(--muted); font-size: .8rem; margin-top: 1rem; max-width: 70ch; }

  /* celular: cada acesso vira um bloco com rótulos */
  @media (max-width: 760px) {
    .log thead { display: none; }
    .log, .log tbody, .log tr, .log td { display: block; width: 100%; }
    .log tr { padding: .75rem 1rem; border-bottom: 1px solid var(--line); }
    .log td { border: 0; padding: .2rem 0; display: flex; justify-content: space-between; gap: 1rem; white-space: normal; }
    .log td::before { content: attr(data-label); color: var(--muted); font-size: .8rem; }
    .log td.num { text-align: left; }
  }
</style>
</head>
<body>
<main>
  <h1>Acessos aos cases</h1>
  <p class="sub">Atualizado ${esc(fullDate(new Date().toISOString()))}</p>
  ${chips}
  <section class="cards">${cardsHtml}</section>
  <h2>Últimos acessos</h2>
  ${logHtml}
  <p class="note">
    Até 500 acessos guardados por origem; médias calculadas sobre eles.
    <b>Revisita</b>: voltou em até 30 min pelo cookie, sem digitar a senha (inclui recarregar a página).
    <b>Local</b>: aproximado pelo IP. <b>Leitura</b>: quanto do conteúdo protegido passou pela tela
    (5–15% ≈ só abriu). <b>Tempo</b>: aba visível, em min:s.
  </p>
</main>
</body>
</html>`)
}
