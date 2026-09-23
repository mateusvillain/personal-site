/**
 * Marca-texto no markdown dos posts.
 *
 *   Um ==trecho destacado== no meio do paragrafo.
 *
 * vira `<mark data-hl="N">trecho destacado</mark>`, onde `N` escolhe qual dos
 * tracinhos de marcador o CSS desenha (veja `src/sass/blog/_highlight.scss`).
 * A variante sai de um hash do proprio texto: o mesmo trecho sempre recebe o
 * mesmo tracinho, entao a pagina nao muda de forma a cada build, mas dois
 * destaques diferentes dificilmente ficam iguais.
 *
 * Regras da marcacao:
 * - a abertura precisa colar no texto (`==assim`), e o fechamento tambem
 *   (`assim==`), para nao capturar comparacoes soltas como `x == y`;
 * - o destaque nao atravessa paragrafo, item de lista ou celula de tabela;
 * - dentro de bloco de codigo ou de `code` inline nada e tocado;
 * - formatacao aninhada continua funcionando: `==um **destaque** forte==`.
 *
 * Quem preferir escrever o HTML na mao tambem pode: `<mark>trecho</mark>`
 * (ou `<mark data-hl="3">`) funciona igual, porque o estilo e da tag.
 */

const VARIANTS = 4

/**
 * FNV-1a: hash curtinho e estavel, so para espalhar as variantes.
 * @param {string} text
 */
function pickVariant(text) {
  let hash = 0x811c9dc5

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }

  return ((hash >>> 0) % VARIANTS) + 1
}

/** Texto cru de um trecho, usado so para calcular a variante. */
function plainText(nodes) {
  return nodes
    .map((node) => {
      if (typeof node.value === 'string') return node.value
      if (Array.isArray(node.children)) return plainText(node.children)
      return ''
    })
    .join('')
}

/**
 * `==` que abre: precisa vir seguido de algo que nao seja espaco. No fim do
 * node o que vem depois e o proximo irmao (`==**negrito** assim==`), entao
 * `edge` diz se aquela ponta ainda tem conteudo pela frente.
 */
function findOpen(value, { edge = false } = {}) {
  for (let i = value.indexOf('=='); i !== -1; i = value.indexOf('==', i + 1)) {
    const next = value[i + 2]
    if (next === undefined ? edge : !/\s/.test(next)) return i
  }

  return -1
}

/** `==` que fecha: precisa vir colado no fim do trecho destacado. */
function findClose(value, { edge = false } = {}) {
  for (let i = value.indexOf('=='); i !== -1; i = value.indexOf('==', i + 1)) {
    const previous = value[i - 1]
    if (previous === undefined ? edge : !/\s/.test(previous)) return i
  }

  return -1
}

function text(value) {
  return { type: 'text', value }
}

/**
 * Node fora do mdast padrao: o `data.hName`/`data.hProperties` e o que o
 * remark-rehype usa para montar a tag final, sem precisar de HTML cru.
 */
function mark(children) {
  return {
    type: 'highlight',
    data: {
      hName: 'mark',
      hProperties: { 'data-hl': pickVariant(plainText(children)) },
    },
    children,
  }
}

/**
 * Varre os filhos de um node procurando os pares de `==`. O destaque pode
 * comecar e terminar em nodes diferentes (`==com **negrito** dentro==`), por
 * isso a varredura e feita na lista inteira e nao node a node.
 */
function highlightChildren(children) {
  const queue = [...children]
  const out = []

  while (queue.length > 0) {
    const node = queue.shift()

    if (node.type !== 'text') {
      out.push(node)
      continue
    }

    const open = findOpen(node.value, { edge: queue.length > 0 })

    if (open === -1) {
      out.push(node)
      continue
    }

    const before = node.value.slice(0, open)
    const rest = node.value.slice(open + 2)
    const content = []
    // Irmaos consumidos na busca pelo fechamento, para poder desfazer.
    const consumed = []
    let closed = false

    // Fechamento no mesmo node de texto.
    const close = findClose(rest)

    if (close !== -1) {
      if (close > 0) content.push(text(rest.slice(0, close)))
      queue.unshift(text(rest.slice(close + 2)))
      closed = true
    } else {
      if (rest) content.push(text(rest))

      // Senao, segue pelos irmaos ate achar o fechamento.
      while (queue.length > 0) {
        const next = queue.shift()
        consumed.push(next)

        if (next.type !== 'text') {
          content.push(next)
          continue
        }

        const end = findClose(next.value, { edge: true })

        if (end === -1) {
          content.push(next)
          continue
        }

        if (end > 0) content.push(text(next.value.slice(0, end)))
        queue.unshift(text(next.value.slice(end + 2)))
        closed = true
        break
      }
    }

    // Sem fechamento: o `==` era so um `==`. Devolve tudo como estava.
    if (!closed) {
      out.push(node, ...consumed)
      continue
    }

    if (before) out.push(text(before))
    if (content.length > 0) out.push(mark(content))
  }

  return out.filter((node) => node.type !== 'text' || node.value !== '')
}

const SKIP = new Set(['code', 'inlineCode', 'html', 'highlight'])

function walk(node) {
  if (SKIP.has(node.type) || !Array.isArray(node.children)) return

  node.children = highlightChildren(node.children)
  node.children.forEach(walk)
}

export default function remarkHighlight() {
  return (tree) => {
    walk(tree)
  }
}
