/**
 * Escala tipografica fluida (conteudo protegido do case Locaweb).
 *
 * Uma "janela de navegador" com largura ajustavel: arrastar a borda
 * direita, usar os atalhos (celular, tablet, desktop) ou o controle
 * deslizante muda a largura simulada da tela, e cada estilo e recalculado
 * pelo proprio clamp() para aquela largura. Duas abas:
 *  - Escala: especime de cada estilo, com o tamanho atual em px e onde ele
 *    esta entre o minimo e o maximo do clamp;
 *  - Pagina: uma mini-pagina montada com os estilos.
 *
 * Os textos ficam sempre no tamanho real (o px que o clamp() da para a
 * largura simulada). Quando a largura simulada passa do espaco disponivel,
 * a janela para de crescer e a borda direita fica tracejada: a "tela"
 * continua alem do que cabe aqui. Encolher o conteudo para caber deixava os
 * textos ilegiveis justamente nas telas grandes.
 *
 * Nada confidencial mora aqui: os valores chegam so depois da senha, ja
 * validados pela API. Todo texto entra por textContent.
 */

const COPY = {
  pt: {
    hint: 'Arraste a borda da janela ou escolha uma tela para ver a escala se adaptar.',
    views: { scale: 'Escala', page: 'Página' },
    presets: { mobile: 'Celular', tablet: 'Tablet', desktop: 'Desktop' },
    width: 'Largura da tela',
    resize: 'Redimensionar a janela',
    fixed: 'fixo',
    page: {
      title: 'Seu site no ar hoje',
      subtitle: 'Domínio, e-mail e SSL em um só lugar.',
      headline: 'Escolha seu plano',
      body: 'Todos os planos incluem backup diário e suporte 24 horas.',
      overtitle: 'Incluso em todos os planos',
      body2: 'Certificado SSL, e-mail profissional e migração gratuita.',
      caption: 'Preços sem impostos. Cancele quando quiser.',
    },
  },
  en: {
    hint: 'Drag the window edge or pick a screen to watch the scale adapt.',
    views: { scale: 'Scale', page: 'Page' },
    presets: { mobile: 'Mobile', tablet: 'Tablet', desktop: 'Desktop' },
    width: 'Screen width',
    resize: 'Resize the window',
    fixed: 'fixed',
    page: {
      title: 'Your site, live today',
      subtitle: 'Domain, email and SSL in one place.',
      headline: 'Choose your plan',
      body: 'Every plan includes daily backups and 24/7 support.',
      overtitle: 'Included in every plan',
      body2: 'SSL certificate, professional email and free migration.',
      caption: 'Prices exclude taxes. Cancel anytime.',
    },
  },
}

const ROOT_PX = 16
const MIN_W = 320
const MAX_W = 1920
const PRESETS = { mobile: 375, tablet: 768, desktop: 1440 }

function h(tag, className, text) {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (text != null) el.textContent = text
  return el
}

const round = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d)

// tamanho em px de um estilo numa tela de `w` px (o que o clamp faria)
function sizeAt(s, w) {
  const max = s.fontSize * ROOT_PX
  if (!s.fluid) return max
  const min = s.fluid.min * ROOT_PX
  const pref = (s.fluid.vw * w) / 100 + s.fluid.rem * ROOT_PX
  return Math.min(max, Math.max(min, pref))
}

function clampText(s) {
  if (!s.fluid) return `${round(s.fontSize, 3)}rem`
  const { min, vw, rem } = s.fluid
  // os numeros como foram cadastrados (sem arredondar o coeficiente)
  return `clamp(${min}rem, ${vw}vw + ${rem}rem, ${s.fontSize}rem)`
}

function setFont(el, s) {
  el.style.fontFamily = `'${s.family}', system-ui, sans-serif`
  el.style.fontWeight = String(s.weight)
  el.style.lineHeight = String(s.lineHeight)
  if (s.uppercase) {
    el.style.textTransform = 'uppercase'
    el.style.letterSpacing = '0.04em'
  }
}

export function mount(container, data, locale = 'pt') {
  const t = COPY[locale] || COPY.pt
  const styles = data?.styles || []
  if (!styles.length) return

  const uid = `lwy-${Math.random().toString(36).slice(2, 8)}`
  const sized = [] // [{ el, s }]: elementos cujo font-size segue a largura

  const figure = h('figure', 'lwy')

  // --- barra: abas, atalhos e largura ------------------------------------
  const bar = h('div', 'lwy__bar')

  const tabs = h('div', 'lwy-seg')
  tabs.setAttribute('role', 'tablist')
  const viewTabs = {}
  ;['scale', 'page'].forEach((key) => {
    const b = h('button', 'lwy-seg__opt', t.views[key])
    b.type = 'button'
    b.id = `${uid}-tab-${key}`
    b.setAttribute('role', 'tab')
    b.setAttribute('aria-controls', `${uid}-view-${key}`)
    tabs.append(b)
    viewTabs[key] = b
  })

  const presets = h('div', 'lwy-presets')
  const presetBtns = Object.entries(PRESETS).map(([key, w]) => {
    const b = h('button', 'lwy-presets__btn', t.presets[key])
    b.type = 'button'
    b.dataset.w = String(w)
    presets.append(b)
    return b
  })

  const range = h('input', 'lwy-range')
  range.type = 'range'
  range.min = String(MIN_W)
  range.max = String(MAX_W)
  range.step = '1'
  range.setAttribute('aria-label', t.width)

  bar.append(tabs, presets)

  // --- janela ---------------------------------------------------------------
  const stage = h('div', 'lwy__stage')
  const win = h('div', 'lwy-win')
  const chrome = h('div', 'lwy-win__chrome')
  chrome.setAttribute('aria-hidden', 'true')
  const dots = h('span', 'lwy-win__dots')
  dots.append(h('i'), h('i'), h('i'))
  const widthLabel = h('span', 'lwy-win__width')
  chrome.append(dots, widthLabel)

  const clip = h('div', 'lwy-win__clip')
  const inner = h('div', 'lwy-win__inner')
  clip.append(inner)

  const handle = h('div', 'lwy-win__handle')
  handle.setAttribute('aria-hidden', 'true')
  handle.title = t.resize

  win.append(chrome, clip, handle)
  stage.append(win)

  // aba Escala: especimes
  const scaleView = h('ul', 'lwy-list')
  scaleView.id = `${uid}-view-scale`
  scaleView.setAttribute('role', 'tabpanel')
  scaleView.setAttribute('aria-labelledby', viewTabs.scale.id)

  const rowParts = []
  styles.forEach((s) => {
    const li = h('li', 'lwy-row')

    const meta = h('div', 'lwy-row__meta')
    const now = h('span', 'lwy-row__now')
    meta.append(
      h('span', 'lwy-row__name', s.name),
      h('code', 'lwy-row__tag', `<${s.tag}>`),
      now,
      h('span', 'lwy-row__lh', `lh ${s.lineHeight}`),
    )

    const sample = h('p', 'lwy-row__sample', data.sample || 'The quick brown fox jumps over the lazy dog')
    sample.setAttribute('aria-hidden', 'true')
    setFont(sample, s)
    sized.push({ el: sample, s })

    // onde o tamanho atual esta entre o minimo e o maximo do clamp
    const bounds = h('div', 'lwy-row__range')
    const fill = h('i', 'lwy-row__fill')
    if (s.fluid) {
      bounds.append(
        h('span', 'lwy-row__end', `${round(s.fluid.min * ROOT_PX)}px`),
        h('span', 'lwy-row__track'),
        h('span', 'lwy-row__end', `${round(s.fontSize * ROOT_PX)}px`),
      )
      bounds.children[1].append(fill)
    }

    // fixo: so o valor; fluido: a barra e o clamp
    const formula = h('code', 'lwy-row__clamp', s.fluid ? clampText(s) : `${clampText(s)} · ${t.fixed}`)

    li.append(meta, sample, ...(s.fluid ? [bounds] : []), formula)
    scaleView.append(li)
    rowParts.push({ s, now, fill })
  })

  // aba Pagina: mini-pagina
  const byRole = {}
  styles.forEach((s) => {
    if (s.role !== 'none' && !byRole[s.role]) byRole[s.role] = s
  })

  const pageView = h('div', 'lwy-page')
  pageView.id = `${uid}-view-page`
  pageView.setAttribute('role', 'tabpanel')
  pageView.setAttribute('aria-labelledby', viewTabs.page.id)

  const addText = (role, text, parent = pageView) => {
    const s = byRole[role]
    if (!s) return
    const el = h('p', 'lwy-page__el', text)
    el.dataset.label = `<${s.tag}> ${s.name}`
    setFont(el, s)
    sized.push({ el, s })
    parent.append(el)
  }
  // mesma hierarquia do case: o sobretitulo agrupa um conjunto de informacoes
  addText('title', t.page.title)
  addText('subtitle', t.page.subtitle)
  pageView.append(h('hr', 'lwy-page__hr'))
  addText('headline', t.page.headline)
  addText('body', t.page.body)
  const box = h('div', 'lwy-page__box')
  addText('overtitle', t.page.overtitle, box)
  addText('body', t.page.body2, box)
  if (box.childNodes.length) pageView.append(box)
  addText('caption', t.page.caption)

  inner.append(scaleView, pageView)

  const foot = h('div', 'lwy__foot')
  const rangeLabel = h('label', 'lwy__range')
  rangeLabel.append(h('span', 'sr-only', t.width), range)
  foot.append(rangeLabel)

  figure.append(h('p', 'lwy__hint body--sm', t.hint), bar, stage, foot)
  figure.append(h('figcaption', 'sr-only', data.caption || ''))
  container.append(figure)

  // --- estado ---------------------------------------------------------------
  let width = 0 // largura simulada da tela
  let avail = 0 // espaco disponivel para a janela

  function render() {
    win.style.width = `${Math.min(width, avail)}px`
    win.classList.toggle('is-wider', width > avail)

    sized.forEach(({ el, s }) => {
      el.style.fontSize = `${sizeAt(s, width)}px`
    })
    rowParts.forEach(({ s, now, fill }) => {
      const px = sizeAt(s, width)
      now.textContent = `${round(px)}px`
      if (s.fluid) {
        const min = s.fluid.min * ROOT_PX
        const max = s.fontSize * ROOT_PX
        fill.style.width = `${((px - min) / (max - min)) * 100}%`
      }
    })

    widthLabel.textContent = `${Math.round(width)}px`
    range.value = String(Math.round(width))
    range.setAttribute('aria-valuetext', `${Math.round(width)}px`)
    presetBtns.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.w) === Math.round(width))))
  }

  function setWidth(w) {
    width = Math.min(MAX_W, Math.max(MIN_W, w))
    render()
  }

  // a alca fica meio para fora da janela: reserva esse espaco a direita
  const HANDLE_ROOM = 10
  const measure = () => stage.clientWidth - HANDLE_ROOM

  new ResizeObserver(() => {
    avail = measure()
    render()
  }).observe(stage)

  function select(key) {
    Object.entries(viewTabs).forEach(([k, b]) => {
      const on = k === key
      b.setAttribute('aria-selected', String(on))
      b.tabIndex = on ? 0 : -1
    })
    scaleView.hidden = key !== 'scale'
    pageView.hidden = key !== 'page'
    render()
  }
  Object.entries(viewTabs).forEach(([key, b], i, all) => {
    b.addEventListener('click', () => select(key))
    b.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      const next = all[(i + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length]
      select(next[0])
      next[1].focus()
    })
  })

  presetBtns.forEach((b) => b.addEventListener('click', () => setWidth(Number(b.dataset.w))))
  range.addEventListener('input', () => setWidth(Number(range.value)))

  // arrastar a borda: acima do espaco disponivel, cada px arrastado vale mais
  handle.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    handle.setPointerCapture(e.pointerId)
    const x0 = e.clientX
    const w0 = width
    const k = Math.max(1, w0 / avail)
    figure.classList.add('is-resizing')
    const move = (ev) => setWidth(w0 + (ev.clientX - x0) * k)
    const up = () => {
      figure.classList.remove('is-resizing')
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
  })

  // comeca na largura real do espaco
  avail = measure()
  width = Math.max(MIN_W, Math.round(avail))
  select('scale')
}
