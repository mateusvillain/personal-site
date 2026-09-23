// Desenha o marca-texto quando o trecho entra na tela, como quem passa a caneta
;(function () {
  // O estado inicial (traço com largura zero) só existe quando o boot script do
  // layout liga esta flag. Sem ela, o destaque já nasce desenhado — é o que
  // acontece sem JS ou com "reduzir movimento".
  if (!('hlAnimate' in document.documentElement.dataset)) {
    return
  }

  // A partir daqui quem manda é este script, então a rede de segurança do boot
  // (que desligaria a flag se este arquivo não carregasse) pode ser desarmada.
  clearTimeout(window.__hlFallback)

  // Velocidade de caneta: ~900px/s, com piso e teto para um trecho de duas
  // palavras não ficar instantâneo nem um trecho de duas linhas ficar arrastado.
  const SPEED = 900
  const MIN_DURATION = 260
  const MAX_DURATION = 700

  // Destaques que entram juntos saem um atrás do outro, não em bloco.
  const STAGGER = 70

  // Espera para conferir o que ficou para trás na faixa morta do rodapé.
  const TAIL_DELAY = 1200

  // Num destaque de várias linhas cada linha é um retângulo: o que importa para
  // a duração é o tanto de traço somado, não a largura da caixa.
  function inkWidth(mark) {
    return Array.from(mark.getClientRects()).reduce(
      (total, rect) => total + rect.width,
      0,
    )
  }

  function duration(mark) {
    const ms = (inkWidth(mark) / SPEED) * 1000
    return Math.round(Math.min(MAX_DURATION, Math.max(MIN_DURATION, ms)))
  }

  function initHighlights() {
    const marks = Array.from(document.querySelectorAll('.full-post mark'))

    if (marks.length === 0) {
      return
    }

    if (!('IntersectionObserver' in window)) {
      marks.forEach((mark) => mark.classList.add('is-drawn'))
      return
    }

    const pending = new Set(marks)

    function draw(mark, order) {
      mark.style.setProperty('--hl-duration', duration(mark) + 'ms')

      if (order > 0) {
        mark.style.setProperty('--hl-delay', order * STAGGER + 'ms')
      }

      mark.classList.add('is-drawn')
      observer.unobserve(mark)
      pending.delete(mark)
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
      {
        // Espera o trecho entrar de fato na leitura, não encostar na borda.
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.2,
      },
    )

    // Esse `rootMargin` deixa uma faixa morta no rodapé, e um destaque que pare
    // ali com a página já no fim nunca cruzaria a linha: ficaria invisível para
    // sempre. Chegou ao fim, desenha o que sobrou.
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

    marks.forEach((mark) => observer.observe(mark))
    window.addEventListener('scroll', drawTail, { passive: true })

    // Página curta demais para rolar já nasce "no fim".
    setTimeout(drawTail, TAIL_DELAY)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHighlights)
  } else {
    initHighlights()
  }
})()
