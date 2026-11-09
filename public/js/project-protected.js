const script = document.currentScript
const slug = script.dataset.slug
const locale = script.dataset.locale || 'pt'

// Mensagens no idioma da pagina, definidas nos atributos data-msg-* da tag
const messages = {
  required: script.dataset.msgRequired || 'Campo obrigatório.',
  wrongPassword:
    script.dataset.msgWrongPassword ||
    'A senha informada está incorreta. Tente novamente.',
  loadError: script.dataset.msgLoadError || 'Erro ao carregar conteúdo.',
}

const passwordInput = document.getElementById('password')
const unlockForm = document.getElementById('unlock-form')
const errorEl = document.getElementById('error')
const passwordBox = document.getElementById('password-box')
const contentEl = document.getElementById('protected-content')

let currentList = null

// Sem `password`, a API aceita o cookie HttpOnly de desbloqueio gravado
// no ultimo acerto (vale por alguns minutos: refresh e troca de idioma
// nao pedem a senha de novo).
async function verifyPassword(password) {
  const res = await fetch('/api/project/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug, password, locale })
  })

  if (res.status === 401) return { ok: false }
  if (!res.ok) throw new Error('Erro ao carregar projeto')

  const data = await res.json()
  return { ok: true, data }
}

function resetList() {
  currentList = null
}

function getList(type) {
  if (!currentList || currentList.tagName.toLowerCase() !== type) {
    currentList = document.createElement(type)
    contentEl.appendChild(currentList)
  }
  return currentList
}

function renderSections(sections) {
  sections.forEach(section => {
    let el

    switch (section.type) {
      case 'heading':
        resetList()
        el = document.createElement(`h${section.level}`)
        el.innerHTML = section.html
        el.className = styles.heading[section.level] || 'headline'
        break

      case 'text':
        resetList()
        el = document.createElement('p')
        el.innerHTML = section.html
        el.className = styles.text
        break

      case 'image':
        resetList()
        el = document.createElement('img')
        el.src = section.src
        el.alt = section.alt || ''
        el.loading = 'lazy'
        el.className = styles.image
        break

      case 'list-item':
        const list = getList(section.listType)
        el = document.createElement('li')
        el.innerHTML = section.html
        list.appendChild(el)
        return

      case 'quote':
        resetList()
        el = document.createElement('blockquote')
        el.innerHTML = section.html
        el.className = styles.quote
        break

      case 'code':
        resetList()
        el = codeWindow(section)
        break

      case 'divider':
        resetList()
        el = document.createElement('hr')
        break

      case 'token-map':
        resetList()
        // visual interativo: o codigo e carregado so quando o case tem um
        el = document.createElement('div')
        import('/js/widgets/token-map.js')
          .then((m) => m.mount(el, section.data, locale))
          .catch(() => el.remove())
        break

      case 'type-scale':
        resetList()
        el = document.createElement('div')
        import('/js/widgets/type-scale.js')
          .then((m) => m.mount(el, section.data, locale))
          .catch(() => el.remove())
        break
    }

    if (el) {
      contentEl.appendChild(el)
    }
  })

  if (window.Prism) Prism.highlightAll()
  contentEl.querySelectorAll('.code-window code').forEach(addSwatches)
}

/* --- blocos de codigo ---------------------------------------------------- */

const codeLabels = {
  pt: { copy: 'Copiar', copied: 'Copiado', code: 'Código', preview: 'Prévia' },
  en: { copy: 'Copy', copied: 'Copied', code: 'Code', preview: 'Preview' },
}

const languageNames = {
  css: 'CSS',
  scss: 'SCSS',
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  html: 'HTML',
  markup: 'HTML',
  json: 'JSON',
  bash: 'Terminal',
}

const COPY_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="2"/><path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5"/></svg>'
const CHECK_ICON =
  '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3 3 7-7"/></svg>'

// Janela de editor: barra (titulo ou abas, linguagem e botao de copiar),
// numeros de linha e o codigo. O texto vem do Sanity e entra so por
// textContent. Com mais de uma aba, so o painel ativo aparece e a janela
// acompanha a altura do codigo dele.
let codeWindowCount = 0

function codeWindow(section) {
  const t = codeLabels[locale] || codeLabels.pt
  const uid = `cw-${++codeWindowCount}`

  const tabs = (section.tabs?.length ? section.tabs : [section]).map((tab) => {
    const lang = /^[a-z0-9-]+$/.test(tab.language || '') ? tab.language : 'css'
    return {
      label: tab.label || '',
      lang,
      langName: languageNames[lang] || lang.toUpperCase(),
      text: String(tab.html || '').replace(/\s+$/, ''),
      preview: hasPreview(tab.preview) ? tab.preview : null,
    }
  })
  const hasTabs = tabs.length > 1
  let active = 0

  const figure = document.createElement('figure')
  figure.className = 'code-window' + (hasTabs ? ' has-tabs' : '')

  /* barra */
  const bar = document.createElement('div')
  bar.className = 'code-window__bar'

  const dots = document.createElement('span')
  dots.className = 'code-window__dots'
  dots.setAttribute('aria-hidden', 'true')
  dots.innerHTML = '<i></i><i></i><i></i>'
  bar.append(dots)

  const tabButtons = []
  if (hasTabs) {
    const list = document.createElement('div')
    list.className = 'code-window__tabs'
    list.setAttribute('role', 'tablist')
    list.setAttribute('aria-label', t.code)

    tabs.forEach((tab, i) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'code-window__tab'
      btn.id = `${uid}-tab-${i}`
      btn.setAttribute('role', 'tab')
      btn.setAttribute('aria-controls', `${uid}-panel-${i}`)
      btn.textContent = tab.label || tab.langName
      btn.addEventListener('click', () => {
        select(i)
        btn.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      })
      btn.addEventListener('keydown', (event) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }
        if (!(event.key in keys)) return
        event.preventDefault()
        const next = (keys[event.key] + tabs.length) % tabs.length
        select(next)
        tabButtons[next].focus()
        tabButtons[next].scrollIntoView({ block: 'nearest', inline: 'nearest' })
      })
      tabButtons.push(btn)
      list.append(btn)
    })
    bar.append(list)
  } else if (section.title) {
    const title = document.createElement('span')
    title.className = 'code-window__title'
    title.textContent = section.title
    bar.append(title)
  }

  const langLabel = document.createElement('span')
  langLabel.className = 'code-window__lang'

  const copy = document.createElement('button')
  copy.type = 'button'
  copy.className = 'code-window__copy'

  const setCopy = (copied) => {
    copy.classList.toggle('is-copied', copied)
    copy.innerHTML = (copied ? CHECK_ICON : COPY_ICON) + '<span></span>'
    copy.lastChild.textContent = copied ? t.copied : t.copy
  }
  setCopy(false)

  let resetTimer
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(tabs[active].text)
    } catch {
      return
    }
    setCopy(true)
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => setCopy(false), 1800)
  })

  bar.append(langLabel, copy)

  /* paineis */
  const panels = document.createElement('div')
  panels.className = 'code-window__panels'

  const panelEls = tabs.map((tab, i) => {
    const panel = document.createElement('div')
    panel.className = 'code-window__panel'

    if (hasTabs) {
      panel.id = `${uid}-panel-${i}`
      panel.setAttribute('role', 'tabpanel')
      panel.setAttribute('aria-labelledby', `${uid}-tab-${i}`)
    }

    if (tab.preview) panel.append(codePreview(tab.preview, t))

    const body = document.createElement('div')
    body.className = 'code-window__body'

    const gutter = document.createElement('span')
    gutter.className = 'code-window__gutter'
    gutter.setAttribute('aria-hidden', 'true')
    gutter.textContent = Array.from(
      { length: tab.text.split('\n').length },
      (_, n) => n + 1
    ).join('\n')

    const pre = document.createElement('pre')
    pre.className = `language-${tab.lang}`
    pre.tabIndex = 0
    pre.setAttribute('aria-label', `${t.code} ${tab.label || tab.langName}`)

    const code = document.createElement('code')
    code.className = `language-${tab.lang}`
    code.textContent = tab.text

    pre.append(code)
    body.append(gutter, pre)
    panel.append(body)
    panels.append(panel)
    return panel
  })

  function select(i) {
    active = i
    tabButtons.forEach((btn, n) => {
      const on = n === i
      btn.setAttribute('aria-selected', String(on))
      btn.tabIndex = on ? 0 : -1
    })
    panelEls.forEach((panel, n) => {
      panel.classList.toggle('is-active', n === i)
    })
    figure.classList.toggle('is-preview', Boolean(tabs[i].preview))
    langLabel.textContent = tabs[i].langName
    clearTimeout(resetTimer)
    setCopy(false)
  }

  select(0)
  figure.append(bar, panels)
  return figure
}

function hasPreview(preview) {
  return Boolean(
    preview && (typeof preview.html === 'string' || preview.declarations?.length)
  )
}

// Previa do codigo. Sem HTML proprio: um card de exemplo recebe as
// declaracoes que a API ja filtrou (so propriedades visuais, sem url()).
// Com HTML/CSS proprios: um iframe sandbox monta a interface, e o elemento
// com data-preview recebe as declaracoes como padrao (especificidade zero,
// antes do CSS da previa): qualquer regra do CSS da previa, :hover
// inclusive, vence.
function codePreview(preview, t) {
  const stage = document.createElement('div')
  stage.className = 'code-window__preview'

  const label = document.createElement('span')
  label.className = 'code-window__preview-label'
  label.textContent = t.preview
  stage.append(label)

  const declarations = (preview.declarations || []).filter(
    (item) => typeof item?.prop === 'string' && typeof item?.value === 'string'
  )

  if (typeof preview.html === 'string') {
    stage.classList.add('is-custom')
    stage.append(previewFrame(preview.html, preview.css || '', declarations, t))
    return stage
  }

  const sample = document.createElement('div')
  sample.className = 'code-window__sample'
  sample.setAttribute('aria-hidden', 'true')
  sample.innerHTML = '<i class="code-window__sample-avatar"></i><span><i></i><i></i></span>'
  // setProperty ignora valor invalido: CSS com erro nao quebra a previa
  declarations.forEach(({ prop, value }) => sample.style.setProperty(prop, value))
  stage.append(sample)
  return stage
}

// sandbox sem allow-scripts: nada executa la dentro. allow-same-origin so
// para medir a altura do conteudo. A CSP corta qualquer recurso externo.
function previewFrame(html, css, declarations, t) {
  const frame = document.createElement('iframe')
  frame.className = 'code-window__frame'
  frame.title = t.preview
  frame.setAttribute('sandbox', 'allow-same-origin')
  frame.setAttribute('loading', 'lazy')

  const noClose = (text) => text.replace(/<\/(style)/gi, '<\\/$1')
  const applied = declarations.length
    ? `:where([data-preview]){${declarations
        .map(({ prop, value }) => `${prop}:${value}`)
        .join(';')}}`
    : ''

  frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'self'">
<style>
@font-face{font-family:'Geist';src:url('/fonts/Geist-VariableFont_wght.woff2') format('woff2');font-weight:100 900}
:root{color-scheme:light}
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;background:transparent}
body{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:24px;padding:44px 24px 40px;font:14px/1.5 Geist,system-ui,sans-serif;color:#24292f}
</style>
<style>${noClose(applied)}</style>
<style>${noClose(css)}</style>
</head><body>${html}</body></html>`

  // a altura acompanha o conteudo (inclusive ao trocar de aba ou de largura)
  frame.addEventListener('load', () => {
    const body = frame.contentDocument?.body
    if (!body) return
    const fit = () => {
      frame.style.height = `${Math.ceil(body.getBoundingClientRect().height)}px`
    }
    fit()
    new ResizeObserver(fit).observe(body)
  })

  return frame
}

// Mostra uma amostra ao lado de cada cor hexadecimal do codigo
const HEX = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi

function addSwatches(code) {
  const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT)
  const nodes = []
  while (walker.nextNode()) {
    if (HEX.test(walker.currentNode.nodeValue)) nodes.push(walker.currentNode)
    HEX.lastIndex = 0
  }

  nodes.forEach((node) => {
    const frag = document.createDocumentFragment()
    const value = node.nodeValue
    let last = 0
    value.replace(HEX, (match, offset) => {
      frag.append(value.slice(last, offset))
      const swatch = document.createElement('span')
      swatch.className = 'code-window__swatch'
      swatch.setAttribute('aria-hidden', 'true')
      swatch.style.backgroundColor = match
      frag.append(swatch, match)
      last = offset + match.length
      return match
    })
    frag.append(value.slice(last))
    node.replaceWith(frag)
  })
}

const styles = {
  heading: {
    1: 'title',
    2: 'headline',
    3: 'block-title'
  },
  text: 'body--lg',
  quote: 'quote',
  code: 'language-css',
  image: 'content-image'
}

const isWebComponent = passwordInput?.tagName?.toLowerCase() === 'lui-input'

function getPassword() {
  if (isWebComponent) {
    return passwordInput.shadowRoot?.querySelector('input')?.value ?? ''
  }
  return passwordInput.value
}

function showError(message) {
  if (isWebComponent) {
    passwordInput.errorText = message
    passwordInput.error = true
  } else if (errorEl) {
    errorEl.textContent = message
    errorEl.hidden = false
  }
}

function clearError() {
  if (isWebComponent) {
    passwordInput.error = false
  } else if (errorEl) {
    errorEl.hidden = true
  }
}

// A tecla Enter disparada dentro do shadow DOM do lui-input nem sempre
// propaga como submit nativo do form, então garantimos aqui.
passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    unlockForm.requestSubmit()
  }
})

// O auto-unlock (cookie) e o submit manual correm em paralelo; só o
// primeiro sucesso pode renderizar, senão o conteúdo aparece duplicado.
let unlocked = false

function unlock(sections) {
  if (unlocked) return
  unlocked = true
  passwordBox.remove()
  renderSections(sections)
}

unlockForm.addEventListener('submit', async (event) => {
  event.preventDefault()
  clearError()

  const password = getPassword()

  if (!password) {
    showError(messages.required)
    return
  }

  try {
    const result = await verifyPassword(password)

    if (!result.ok) {
      if (!unlocked) showError(messages.wrongPassword)
      return
    }

    // So conta o acerto da senha; o auto-unlock pelo cookie nao e conversao.
    if (!unlocked && typeof window.gtag === 'function') {
      window.gtag('event', 'case_unlock', { project: slug })
    }
    unlock(result.data.sections)
  } catch (err) {
    if (!unlocked) showError(messages.loadError)
  }
})

// Tenta destravar com o cookie de sessao antes de mostrar o formulario.
// Qualquer falha (401, rede) so mantem o form visivel, sem mensagem.
;(async () => {
  try {
    const result = await verifyPassword(undefined)
    if (!result.ok) return
    unlock(result.data.sections)
  } catch (err) {
    /* segue com o formulario */
  }
})()
