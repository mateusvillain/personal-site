// Um unico fundo de hover que desliza ate o item sob o cursor (ou com foco de
// teclado), em vez de cada item acender e apagar sozinho. O container recebe
// .is-enhanced para o CSS desligar o :hover proprio de cada item; sem JS, o
// :hover antigo continua valendo.

export function initHoverHighlight(container: HTMLElement, rowSelector: string) {
  const highlight = document.createElement('span')
  highlight.className = 'hover-highlight'
  highlight.setAttribute('aria-hidden', 'true')
  container.prepend(highlight)
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative'
  }

  let current: HTMLElement | null = null

  // O item pode ser o proprio link ou estar dentro/fora dele.
  const rowFrom = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return null
    const row =
      target.closest<HTMLElement>(rowSelector) ??
      target.querySelector<HTMLElement>(rowSelector)
    return row && container.contains(row) ? row : null
  }

  const place = (row: HTMLElement) => {
    const box = container.getBoundingClientRect()
    const rect = row.getBoundingClientRect()
    highlight.style.transform = `translate(${rect.left - box.left}px, ${rect.top - box.top}px)`
    highlight.style.width = `${rect.width}px`
    highlight.style.height = `${rect.height}px`
    highlight.style.borderRadius = getComputedStyle(row).borderRadius
  }

  const show = (row: HTMLElement) => {
    if (row === current) return
    // Vindo de fora da lista: aparece direto no item, sem deslizar.
    if (!current) {
      highlight.classList.add('is-instant')
      place(row)
      highlight.getBoundingClientRect()
      highlight.classList.remove('is-instant')
    } else {
      place(row)
    }
    current = row
    highlight.classList.add('is-visible')
  }

  const hide = () => {
    current = null
    highlight.classList.remove('is-visible')
  }

  // Ao sair com o mouse, volta para o item com foco de teclado, se houver.
  const settle = () => {
    const focused = container.querySelector(':focus-visible')
    const row = focused && rowFrom(focused)
    if (row) show(row)
    else hide()
  }

  container.addEventListener('pointerover', (event) => {
    const row = rowFrom(event.target)
    if (row) show(row)
  })
  container.addEventListener('pointerleave', settle)
  container.addEventListener('focusin', (event) => {
    const target = event.target as Element
    const row = rowFrom(target)
    if (row && target.matches(':focus-visible')) show(row)
  })
  container.addEventListener('focusout', (event) => {
    if (container.contains(event.relatedTarget as Node)) return
    if (!container.matches(':hover')) hide()
  })

  new ResizeObserver(() => current && place(current)).observe(container)
  container.classList.add('is-enhanced')
}
