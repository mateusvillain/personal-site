/**
 * Nota na margem do markdown dos posts.
 *
 *   Um paragrafo qualquer, com a anotacao no fim. ^[minha nota]
 *
 * vira o mesmo paragrafo com a nota escrita a mao ao lado: um colchete
 * marcando as linhas do paragrafo e o texto da nota depois dele (no desktop
 * largo, na margem direita; abaixo disso, embaixo do paragrafo). Estilo em
 * `src/sass/blog/_margin-note.scss`, desenho em `public/blog/js/margin-note.js`.
 *
 * Regras da marcacao:
 * - a nota precisa ser a ultima coisa do paragrafo e vale para ele inteiro;
 * - o texto da nota e simples (sem formatacao) e nao pode conter `]`;
 * - `^[...]` no meio do paragrafo fica como texto.
 *
 * `^[...]` e a nota de rodape em linha do Pandoc: no `.md` cru que o site
 * publica, a anotacao continua legivel no lugar certo.
 */

const NOTE = /\s*\^\[([^\]\n]+)\]\s*$/

// Lido antes da nota por leitores de tela, para ela nao parecer continuacao
// do paragrafo.
const LABELS = {
  en: 'Margin note:',
  pt: 'Nota na margem:',
}

function localeOf(file) {
  const path = (file.history?.[0] ?? file.path ?? '').replaceAll('\\', '/')
  return path.includes('/pt/') ? 'pt' : 'en'
}

const h = (tagName, properties, children = []) => ({
  type: 'element',
  tagName,
  properties,
  children,
})

/**
 * Colchete desenhado a mao. Os dois sao esticados ate o tamanho do paragrafo
 * (`preserveAspectRatio='none'`) sem engrossar o traco (`non-scaling-stroke`):
 * as pontas quase nao tem extensao no eixo esticado, entao nao deformam.
 */
const BRACKETS = {
  // "]" ao lado do paragrafo, pontas viradas para o texto.
  y: {
    viewBox: '0 0 12 100',
    d: 'M1.2,1.4C4,0.9,6.6,1.1,9.2,1.9C9.6,28,8.7,62,9.7,98.2C7.2,98.9,4.2,99.1,1.4,98.7',
  },
  // Embaixo do paragrafo, pontas viradas para cima.
  x: {
    viewBox: '0 0 100 12',
    d: 'M0.4,1.4C0.7,5,0.9,7.8,1.5,9.6C28,10.4,64,9.2,98.4,10.1C98.9,7.6,99.2,4.4,99.6,1.2',
  },
}

function bracket(axis) {
  const { viewBox, d } = BRACKETS[axis]
  return h(
    'svg',
    {
      className: ['margin-note__bracket', `margin-note__bracket--${axis}`],
      viewBox,
      preserveAspectRatio: 'none',
      ariaHidden: 'true',
      focusable: 'false',
    },
    [
      h('path', {
        d,
        vectorEffect: 'non-scaling-stroke',
      }),
    ],
  )
}

export default function remarkMarginNote() {
  return (tree, file) => {
    const label = LABELS[localeOf(file)]

    const walk = (node) => {
      if (!Array.isArray(node.children)) return

      if (node.type === 'paragraph') {
        const last = node.children.at(-1)
        const match = last?.type === 'text' && last.value.match(NOTE)
        if (!match) return

        last.value = last.value.slice(0, match.index)
        if (last.value === '') node.children.pop()

        node.data = {
          ...node.data,
          hProperties: { className: ['has-margin-note'] },
        }
        node.children.push({
          type: 'marginNote',
          data: {
            hName: 'span',
            hProperties: { className: ['margin-note'] },
            hChildren: [
              h('span', { className: ['sr-only'] }, [
                { type: 'text', value: ` ${label} ` },
              ]),
              bracket('y'),
              bracket('x'),
              h('span', { className: ['margin-note__text'] }, [
                { type: 'text', value: match[1].trim() },
              ]),
            ],
          },
        })
        return
      }

      node.children.forEach(walk)
    }

    walk(tree)
  }
}
