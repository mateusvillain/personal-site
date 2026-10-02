// Ajusta o espaco das notas na margem e as escreve quando entram na tela:
// primeiro o colchete e tracado, depois a nota e escrita da esquerda para a
// direita (estilo em src/sass/blog/_margin-note.scss). Mesmo esquema do
// marca-texto: sem a flag do boot script do layout (sem JS, "reduzir
// movimento"), a nota ja nasce escrita.
;(function () {
  // Na margem (>= 1280px) a nota e posicionada ao lado do paragrafo e nao
  // ocupa espaco no fluxo: se ela for mais alta que ele, invadiria o
  // paragrafo seguinte (e a nota dele). Nesse caso o paragrafo ganha altura
  // minima para conte-la. Vale com ou sem animacao.
  const margin = window.matchMedia('(min-width: 1280px)')

  function fitNotes() {
    document.querySelectorAll('.full-post .margin-note').forEach((note) => {
      const paragraph = note.parentElement
      const text = note.querySelector('.margin-note__text')
      if (!paragraph || !text) return

      paragraph.style.minHeight = ''
      if (!margin.matches) return

      if (text.offsetHeight > paragraph.offsetHeight) {
        paragraph.style.minHeight = text.offsetHeight + 'px'
      }
    })
  }

  function initLayout() {
    fitNotes()
    margin.addEventListener('change', fitNotes)
    window.addEventListener('resize', fitNotes)
    // A altura da nota so e a final com a fonte manuscrita carregada.
    if (document.fonts) document.fonts.ready.then(fitNotes)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout)
  } else {
    initLayout()
  }

  if (!('mnAnimate' in document.documentElement.dataset)) {
    return
  }

  clearTimeout(window.__mnFallback)

  // Ritmo de quem escreve: ~260px/s, com piso e teto.
  const SPEED = 260
  const MIN_DURATION = 450
  const MAX_DURATION = 1400

  // Notas que entram juntas sao escritas uma depois da outra.
  const STAGGER = 180

  function duration(note) {
    const text = note.querySelector('.margin-note__text')
    // Nota de varias linhas e escrita linha a linha no papel, mas aqui a
    // revelacao corre todas juntas: vale a linha mais larga.
    const width = text ? text.getBoundingClientRect().width : 0
    const ms = (width / SPEED) * 1000
    return Math.round(Math.min(MAX_DURATION, Math.max(MIN_DURATION, ms)))
  }

  function initNotes() {
    const notes = Array.from(document.querySelectorAll('.full-post .margin-note'))

    if (notes.length === 0) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      notes.forEach((note) => note.classList.add('is-drawn'))
      return
    }

    const pending = new Set(notes)

    function draw(note, order) {
      note.style.setProperty('--mn-duration', duration(note) + 'ms')

      if (order > 0) {
        note.style.setProperty('--mn-delay', order * STAGGER + 'ms')
      }

      note.classList.add('is-drawn')
      observer.unobserve(note)
      pending.delete(note)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0

        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          draw(entry.target, order)
          order += 1
        })

        if (pending.size === 0) {
          window.removeEventListener('scroll', drawTail)
        }
      },
      // Mesma linha de leitura do marca-texto.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    )

    // Como no marca-texto: o `rootMargin` deixa uma faixa morta no rodape, e
    // uma nota parada ali com a pagina ja no fim seria escrita nunca.
    function drawTail() {
      const reachedEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2

      if (!reachedEnd || pending.size === 0) {
        return
      }

      Array.from(pending).forEach(draw)
      window.removeEventListener('scroll', drawTail)
    }

    notes.forEach((note) => observer.observe(note))
    window.addEventListener('scroll', drawTail, { passive: true })
    setTimeout(drawTail, 1200)
  }

  // Com a entrada do post rodando (ver BlogLayout.astro), espera o texto
  // assentar antes de escrever.
  function start() {
    if (window.__postEntering) {
      document.addEventListener('post:entered', initNotes, { once: true })
    } else {
      initNotes()
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start)
  } else {
    start()
  }
})()
