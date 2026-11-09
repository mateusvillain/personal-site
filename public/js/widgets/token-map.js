/**
 * Mapa de tokens semanticos (conteudo protegido do case Locaweb).
 *
 * Recebe os dados do Sanity (via /api/project/) e desenha a lista de tokens
 * ao lado de uma mini-interface pintada com as proprias cores. Passar o
 * cursor, focar ou tocar num token destaca onde ele aparece; num primitivo,
 * destaca todos os semanticos que reaproveitam a mesma cor.
 *
 * Nada confidencial mora aqui: nomes e cores chegam so depois da senha.
 * Todo texto entra por textContent, e as cores ja vem validadas da API.
 */

const COPY = {
  pt: {
    hint: 'Passe o cursor ou toque em um token para ver onde ele é usado.',
    shared: (n) => `usado por ${n} tokens`,
    title: 'Seu site no ar',
    body: 'Hospedagem com domínio, e-mail e certificado SSL.',
    field: 'seu-dominio.com.br',
    alert: 'Pagamento pendente',
    // estados do campo e do aviso (cada token de borda mostra o seu)
    fieldIdle: 'Digite o domínio desejado.',
    fieldOk: 'Domínio disponível',
    fieldError: 'Este domínio já está registrado',
    info: 'A propagação do DNS pode levar até 24h.',
    warning: 'Seu certificado SSL expira em 7 dias.',
    link: 'Ver planos',
    button: 'Contratar',
  },
  en: {
    hint: 'Hover or tap a token to see where it is used.',
    shared: (n) => `used by ${n} tokens`,
    title: 'Your site, live',
    body: 'Hosting with domain, email and SSL certificate.',
    field: 'your-domain.com',
    alert: 'Payment pending',
    fieldIdle: 'Type the domain you want.',
    fieldOk: 'Domain available',
    fieldError: 'This domain is already taken',
    info: 'DNS propagation can take up to 24h.',
    warning: 'Your SSL certificate expires in 7 days.',
    link: 'See plans',
    button: 'Get started',
  },
}

const HEX = /^#[0-9a-f]{6}$/i

// cores de reserva da mini-interface, para papeis sem token no Sanity
const FALLBACK = {
  'bg-page': '#f4f4f5',
  'bg-base': '#ffffff',
  'bg-overlay': '#18181b',
  'bg-primary': '#18181b',
  'bg-danger': '#dc2626',
  'text-heading': '#18181b',
  'text-body': '#52525b',
  'text-inverse': '#ffffff',
  'text-primary': '#18181b',
  'border-stroke': '#d4d4d8',
  'border-divisor': '#e4e4e7',
  'border-danger': '#dc2626',
  'border-info': '#2563eb',
  'border-success': '#16a34a',
  'border-warning': '#d97706',
}

function h(tag, className, text) {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (text != null) el.textContent = text
  return el
}

// papeis (tokens) que pintam o elemento; um elemento pode ter varios
function slot(el, ...roles) {
  el.dataset.slots = roles.join(' ')
  return el
}

const SVG = 'http://www.w3.org/2000/svg'

// icones de 16px: so traco, na cor do texto/borda do estado
const ICONS = {
  ok: 'M4 8.5 6.8 11 12 5.5',
  error: 'M5 5l6 6M11 5l-6 6',
  info: 'M8 7.2V11M8 5h.01',
  warning: 'M8 6v3M8 11h.01',
}

function icon(kind) {
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('viewBox', '0 0 16 16')
  svg.setAttribute('class', 'lwm-ui__icon')
  if (kind === 'info' || kind === 'warning') {
    const shape = document.createElementNS(SVG, 'path')
    shape.setAttribute(
      'd',
      kind === 'info' ? 'M8 1.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 8 1.8z' : 'M8 2 14.5 13.5h-13z',
    )
    svg.append(shape)
  }
  const path = document.createElementNS(SVG, 'path')
  path.setAttribute('d', ICONS[kind])
  svg.append(path)
  return svg
}

/*
 * Mini-interface. Campo e aviso tem estados: em repouso o campo e neutro
 * (stroke) e o aviso e de info; ao destacar um token de borda, o card
 * troca para o cenario em que aquele token aparece.
 */
function buildPreview(t) {
  const root = slot(h('div', 'lwm-ui'), 'bg-page')
  root.setAttribute('aria-hidden', 'true')

  const card = slot(h('div', 'lwm-ui__card'), 'bg-base', 'border-stroke')

  const field = h('div', 'lwm-ui__fieldset')
  const input = slot(
    h('span', 'lwm-ui__field', t.field),
    'border-stroke',
    'border-danger',
    'border-success',
  )
  const help = h('span', 'lwm-ui__help')
  field.append(input, help)

  const notice = slot(h('p', 'lwm-ui__notice'), 'border-info', 'border-warning')

  const alert = slot(h('p', 'lwm-ui__alert'), 'bg-danger')
  alert.append(slot(h('span', null, t.alert), 'text-inverse'))

  const foot = h('div', 'lwm-ui__foot')
  const button = slot(h('span', 'lwm-ui__button'), 'bg-primary')
  button.append(slot(h('span', null, t.button), 'text-inverse'))
  foot.append(slot(h('span', 'lwm-ui__link', t.link), 'text-primary'), button)

  card.append(
    slot(h('p', 'lwm-ui__title', t.title), 'text-heading'),
    slot(h('p', 'lwm-ui__body', t.body), 'text-body'),
    slot(h('hr', 'lwm-ui__hr'), 'border-divisor'),
    field,
    notice,
    alert,
    foot,
  )
  root.append(card, slot(h('div', 'lwm-ui__scrim'), 'bg-overlay'))

  const FIELD = {
    idle: [null, t.fieldIdle],
    success: ['ok', t.fieldOk],
    error: ['error', t.fieldError],
  }
  const NOTICE = { info: t.info, warning: t.warning }

  // troca o estado do campo e do aviso
  root.setState = ({ field: f = 'idle', notice: n = 'info' } = {}) => {
    if (root.dataset.field !== f) {
      root.dataset.field = f
      const [kind, text] = FIELD[f]
      help.replaceChildren(...(kind ? [icon(kind)] : []), h('span', null, text))
    }
    if (root.dataset.notice !== n) {
      root.dataset.notice = n
      notice.replaceChildren(icon(n), h('span', null, NOTICE[n]))
    }
  }
  root.setState()
  return root
}

export function mount(container, data, locale = 'pt') {
  const t = COPY[locale] || COPY.pt
  const groups = (data?.groups || []).filter((g) => g.tokens?.length)
  if (!groups.length) return

  const rows = groups.flatMap((g) => g.tokens).filter((tk) => HEX.test(tk.hex))
  const uses = new Map()
  rows.forEach((tk) => uses.set(tk.primitive, (uses.get(tk.primitive) || 0) + 1))

  const figure = h('figure', 'lwm')
  const caption = h('figcaption', 'sr-only', data.caption || '')

  // cores da mini-interface: o token do Sanity ou a cor de reserva
  const colors = { ...FALLBACK }
  rows.forEach((tk) => {
    if (tk.role && tk.role !== 'none') colors[tk.role] = tk.hex
  })
  Object.entries(colors).forEach(([role, hex]) => figure.style.setProperty(`--${role}`, hex))

  const hint = h('p', 'lwm__hint body--sm', t.hint)
  const body = h('div', 'lwm__body')
  const list = h('div', 'lwm__list')
  const preview = buildPreview(t)
  const stage = h('div', 'lwm__stage')
  const readout = h('p', 'lwm__readout')
  readout.setAttribute('aria-live', 'polite')
  stage.append(preview, readout)

  const rowEls = []

  // um grupo por aba (Background, Content, Border...)
  const uid = `lwm-${Math.random().toString(36).slice(2, 8)}`
  const tablist = h('div', 'lwm-tabs')
  tablist.setAttribute('role', 'tablist')
  const tabs = []
  const panels = []

  groups.forEach((group, gi) => {
    const tab = h('button', 'lwm-tabs__tab')
    tab.type = 'button'
    tab.id = `${uid}-tab-${gi}`
    tab.setAttribute('role', 'tab')
    tab.setAttribute('aria-controls', `${uid}-panel-${gi}`)
    tab.append(h('span', null, group.name), h('span', 'lwm-tabs__count', String(group.tokens.length)))
    tablist.append(tab)
    tabs.push(tab)

    const panel = h('ul', 'lwm-group__rows')
    panel.id = `${uid}-panel-${gi}`
    panel.setAttribute('role', 'tabpanel')
    panel.setAttribute('aria-labelledby', tab.id)

    group.tokens.forEach((tk) => {
      if (!HEX.test(tk.hex)) return
      const li = h('li', 'lwm-row')
      li.tabIndex = 0
      li.dataset.role = tk.role || 'none'
      li.dataset.primitive = tk.primitive
      li.setAttribute('aria-label', `${tk.name}: ${tk.primitive}`)

      const chip = h('span', 'lwm-chip')
      const sw = h('i', 'lwm-chip__swatch')
      sw.style.background = tk.hex
      chip.append(sw, h('span', null, tk.primitive))
      chip.dataset.primitive = tk.primitive

      li.append(h('code', 'lwm-row__name', tk.name), chip)
      panel.append(li)
      rowEls.push({ el: li, chip, tk })
    })

    panels.push(panel)
    list.append(panel)
  })

  function select(index, focus) {
    clear()
    tabs.forEach((tab, i) => {
      const on = i === index
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
      panels[i].hidden = !on
    })
    if (focus) tabs[index].focus()
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, false))
    // setas, Home e End trocam de aba (padrao WAI-ARIA)
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: last }[e.key]
      if (next == null) return
      e.preventDefault()
      select(next > last ? 0 : next < 0 ? last : next, true)
    })
  })

  list.prepend(tablist)

  // --- destaque ----------------------------------------------------------
  function clear() {
    figure.classList.remove('is-active')
    rowEls.forEach(({ el }) => el.classList.remove('is-on', 'is-shared'))
    preview.querySelectorAll('.is-target').forEach((el) => el.classList.remove('is-target'))
    preview.classList.remove('is-scrim')
    preview.setState()
    for (const k in sceneNow) delete sceneNow[k]
    readout.textContent = ''
  }

  const sceneNow = {}

  function showRow(entry, viaPrimitive) {
    clear()
    figure.classList.add('is-active')
    const { tk } = entry

    if (viaPrimitive) {
      // todos os semanticos que apontam para o mesmo primitivo
      rowEls
        .filter((r) => r.tk.primitive === tk.primitive)
        .forEach((r) => {
          r.el.classList.add('is-on', 'is-shared')
          target(r.tk.role)
        })
      const n = uses.get(tk.primitive) || 1
      readout.textContent = n > 1 ? `${tk.primitive} · ${t.shared(n)}` : `${tk.primitive} · ${tk.hex}`
    } else {
      entry.el.classList.add('is-on')
      target(tk.role)
      readout.textContent = `${tk.name} → ${tk.primitive} · ${tk.hex}`
    }
  }

  // cenario de cada token de borda de estado
  const SCENES = {
    'border-danger': { field: 'error' },
    'border-success': { field: 'success' },
    'border-warning': { notice: 'warning' },
  }

  function target(role) {
    if (!role || role === 'none') return
    if (SCENES[role]) {
      Object.assign(sceneNow, SCENES[role])
      preview.setState(sceneNow)
    }
    if (role === 'bg-overlay') preview.classList.add('is-scrim')
    preview
      .querySelectorAll(`[data-slots~="${role}"]`)
      .forEach((el) => el.classList.add('is-target'))
  }

  // mouse: hover. Toque: o toque foca a linha (tabindex) e o clique no
  // primitivo mostra o reuso; o pointerleave do toque e ignorado, senao o
  // destaque sumiria assim que o dedo sai da tela.
  const isMouse = (e) => e.pointerType !== 'touch'

  rowEls.forEach((entry) => {
    const { el, chip } = entry
    el.addEventListener('pointerenter', (e) => isMouse(e) && showRow(entry, false))
    chip.addEventListener('pointerenter', (e) => isMouse(e) && showRow(entry, true))
    chip.addEventListener('pointerleave', (e) => isMouse(e) && showRow(entry, false))
    chip.addEventListener('click', () => showRow(entry, true))
    el.addEventListener('focus', () => showRow(entry, false))
  })

  list.addEventListener('pointerleave', (e) => {
    // so mantem o destaque se uma linha estiver focada pelo teclado
    const focused = document.activeElement
    if (isMouse(e) && !(focused?.classList.contains('lwm-row') && list.contains(focused))) clear()
  })
  list.addEventListener('focusout', (e) => {
    if (!list.contains(e.relatedTarget)) clear()
  })

  select(0, false)

  body.append(stage, list)
  figure.append(hint, body, caption)
  container.append(figure)
}
