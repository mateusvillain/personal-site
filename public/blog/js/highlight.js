// Desenha o marca-texto quando o trecho entra na tela, como quem passa a caneta
;(function () {
  // O estado inicial (traço com largura zero) só existe quando o boot script do
  // layout liga esta flag. Sem ela, o destaque já nasce desenhado — é o que
  // acontece sem JS ou com "reduzir movimento".
  if (!('hlAnimate' in document.documentElement.dataset)) {
    return
  }

  // Velocidade de caneta: ~900px/s, com piso e teto para um trecho de duas
  // palavras não ficar instantâneo nem um trecho de duas linhas ficar arrastado.
  const SPEED = 900
  const MIN_DURATION = 260
  const MAX_DURATION = 700

  // Destaques que entram juntos saem um atrás do outro, não em bloco.
  const STAGGER = 70

  function drawAll(marks) {
    marks.forEach((mark) => mark.classList.add('is-drawn'))
  }

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
      drawAll(marks)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        let index = 0

        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return
          }

          const mark = entry.target
          mark.style.setProperty('--hl-duration', duration(mark) + 'ms')

          if (index > 0) {
            mark.style.setProperty('--hl-delay', index * STAGGER + 'ms')
          }

          mark.classList.add('is-drawn')
          observer.unobserve(mark)
          index += 1
        })
      },
      {
        // Espera o trecho entrar de fato na leitura, não encostar na borda.
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.2,
      },
    )

    marks.forEach((mark) => observer.observe(mark))
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHighlights)
  } else {
    initHighlights()
  }
})()
