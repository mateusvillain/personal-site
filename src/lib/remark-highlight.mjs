/**
 * Marca-texto no markdown dos posts.
 *
 *   Um ==trecho destacado== no meio do paragrafo.
 *
 * vira `<mark data-hl="N">trecho destacado</mark>`, onde `N` escolhe qual dos
 * tracinhos de marcador o CSS desenha (veja `src/sass/blog/_highlight.scss`).
 *
 * Regras da marcacao:
 * - a abertura precisa colar no texto (`==assim`), e o fechamento tambem
 *   (`assim==`), para nao capturar comparacoes soltas como `x == y`;
 * - um `==` sem par fica como texto e nao engole o destaque seguinte;
 * - o destaque nao atravessa paragrafo, item de lista ou celula de tabela;
 * - dentro de bloco de codigo ou de `code` inline nada e tocado;
 * - formatacao aninhada continua funcionando: `==um **destaque** forte==`.
 *
 * Quem preferir escrever o HTML na mao tambem pode: `<mark>trecho</mark>`
 * (ou `<mark data-hl="3">`) funciona igual, porque o estilo e da tag.
 */

// Precisa bater com o mapa `$markers` de `src/sass/blog/_highlight.scss`.
const VARIANTS = 8

// Passo coprimo com o total de variantes: andando de 3 em 3 a lista inteira e
// percorrida antes de qualquer traco repetir, entao destaques vizinhos nunca
// saem iguais - que e o que denunciava o truque quando o sorteio era so hash.
const STRIDE = 3

const DELIMITER = '=='

/**
 * FNV-1a: hash curtinho e estavel, so para espalhar as variantes.
 * @param {string} text
 */
function hash(text) {
  let value = 0x811c9dc5

  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i)
    value = Math.imul(value, 0x01000193)
  }

  return value >>> 0
}

/**
 * Sorteia o traco. Parece aleatorio na leitura, mas o ponto de partida sai do
 * texto do primeiro destaque e o resto anda com a posicao, entao o mesmo post
 * rende sempre o mesmo desenho - nao muda de forma a cada build.
 */
function pickVariant(text, state) {
  if (state.seed === null) {
    state.seed = hash(text) % VARIANTS
  }

  const variant = ((state.seed + state.index * STRIDE) % VARIANTS) + 1
  state.index += 1

  return variant
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

function text(value) {
  return { type: 'text', value }
}

/**
 * Node fora do mdast padrao: o `data.hName`/`data.hProperties` e o que o
 * remark-rehype usa para montar a tag final, sem precisar de HTML cru.
 */
function mark(children, state) {
  return {
    type: 'highlight',
    data: {
      hName: 'mark',
      hProperties: { 'data-hl': pickVariant(plainText(children), state) },
    },
    children,
  }
}

/**
 * Quebra os filhos em pedacos de texto, nodes intactos (um `**negrito**`, um
 * link) e os `==` encontrados pelo caminho. Trabalhar com a lista achatada e o
 * que faz um destaque poder comecar num node e terminar em outro.
 */
function tokenize(children) {
  const tokens = []

  for (const child of children) {
    if (child.type !== 'text') {
      tokens.push({ kind: 'node', node: child })
      continue
    }

    const value = child.value
    let start = 0
    let at = value.indexOf(DELIMITER)

    while (at !== -1) {
      if (at > start)
        tokens.push({ kind: 'text', value: value.slice(start, at) })
      tokens.push({
        kind: 'delimiter',
        before: value[at - 1],
        after: value[at + 2],
      })
      start = at + DELIMITER.length
      at = value.indexOf(DELIMITER, start)
    }

    if (start < value.length)
      tokens.push({ kind: 'text', value: value.slice(start) })
  }

  return tokens
}

/**
 * O caractere vizinho do `==`. Quando o delimitador esta na ponta do node, o
 * vizinho e o token do lado: um `**negrito**` colado conta como conteudo, e
 * outro `==` nao conta como nada.
 */
function neighbour(tokens, index, direction) {
  const token = tokens[index + direction]

  if (!token) return ''
  if (token.kind === 'node') return 'x'
  if (token.kind === 'text') {
    return direction < 0 ? token.value.slice(-1) : token.value.slice(0, 1)
  }

  return ''
}

function canOpen(tokens, index) {
  const after = tokens[index].after ?? neighbour(tokens, index, 1)
  return after !== '' && !/\s/.test(after)
}

function canClose(tokens, index) {
  const before = tokens[index].before ?? neighbour(tokens, index, -1)
  return before !== '' && !/\s/.test(before)
}

/** Junta textos vizinhos que sobraram picados pelos `==` sem par. */
function mergeText(nodes) {
  const merged = []

  for (const node of nodes) {
    const last = merged[merged.length - 1]

    if (node.type === 'text' && last && last.type === 'text') {
      last.value += node.value
      continue
    }

    merged.push(node)
  }

  return merged.filter((node) => node.type !== 'text' || node.value !== '')
}

/**
 * Casa os `==` dois a dois. O fechamento procura a abertura mais proxima (a
 * pilha guarda as que ainda estao em aberto), entao um `==` solto no meio do
 * paragrafo fica como texto em vez de engolir o destaque que vem depois.
 */
function highlightChildren(children, state) {
  const tokens = tokenize(children)
  const out = []
  // Onde, dentro de `out`, cada abertura ainda em aberto comecou.
  const open = []

  tokens.forEach((token, index) => {
    if (token.kind === 'node') {
      out.push(token.node)
      return
    }

    if (token.kind === 'text') {
      out.push(text(token.value))
      return
    }

    if (open.length > 0 && canClose(tokens, index)) {
      const start = open.pop()
      // O primeiro e o `==` da abertura, que agora vira a tag.
      const content = mergeText(out.splice(start).slice(1))

      if (content.length > 0) {
        out.push(mark(content, state))
        return
      }

      // `====`: nada entre os dois. Devolve os dois como texto.
      out.push(text(DELIMITER), text(DELIMITER))
      return
    }

    if (canOpen(tokens, index)) {
      open.push(out.length)
    }

    // Enquanto nao fechar, o delimitador e texto comum.
    out.push(text(DELIMITER))
  })

  return mergeText(out)
}

const SKIP = new Set(['code', 'inlineCode', 'html', 'highlight'])

function walk(node, state) {
  if (SKIP.has(node.type) || !Array.isArray(node.children)) return

  node.children = highlightChildren(node.children, state)
  node.children.forEach((child) => walk(child, state))
}

export default function remarkHighlight() {
  return (tree) => {
    // O sorteio anda com o documento: ponto de partida e posicao do destaque.
    walk(tree, { index: 0, seed: null })
  }
}
