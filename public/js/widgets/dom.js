// Utilitarios compartilhados pelos widgets do conteudo protegido
// (token-map e type-scale, que project-protected.js carrega por import()).
// O proprio project-protected.js e script comum e nao importa este arquivo.

export function h(tag, className, text) {
  const el = document.createElement(tag)
  if (className) el.className = className
  if (text != null) el.textContent = text
  return el
}

// Setas, Home e End trocam de aba e levam o foco junto (padrao WAI-ARIA
// de tablist). `onSelect(i)` ativa a aba i.
export function tabKeys(tabs, onSelect) {
  tabs.forEach((tab, i) => {
    tab.addEventListener('keydown', (e) => {
      const last = tabs.length - 1
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: last }[e.key]
      if (next == null) return
      e.preventDefault()
      const n = next > last ? 0 : next < 0 ? last : next
      onSelect(n)
      tabs[n].focus()
    })
  })
}
