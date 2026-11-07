import { getCollection, type CollectionEntry } from 'astro:content'
import { localizePath, locales, type Locale } from '../i18n/config'
import { ui } from '../i18n/ui'

export type Post = CollectionEntry<'blog'>

/** Idioma do post, lido da pasta em que o arquivo esta (`en/...`, `pt/...`). */
export function postLocale(post: Post): Locale {
  return post.id.split('/')[0] as Locale
}

/** Chave que liga as traducoes de um mesmo post: o nome do arquivo. */
export function postKey(post: Post) {
  return post.id.split('/').slice(1).join('/')
}

/** Segmento da URL: o `slug` do frontmatter ou, na falta dele, a chave. */
export function postSlug(post: Post) {
  return post.data.slug ?? postKey(post)
}

/** Caminho absoluto do post, ja com o prefixo do idioma. */
export function postPath(post: Post) {
  return localizePath(`/blog/${postSlug(post)}/`, postLocale(post))
}

/** Posts de um idioma, do mais recente para o mais antigo. */
export async function getPosts(locale: Locale) {
  const posts = await getCollection(
    'blog',
    (post) => postLocale(post) === locale,
  )
  return posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  )
}

/**
 * Caminhos do mesmo post em cada idioma em que ele existe. Usado para os
 * `hreflang` e para o link de troca de idioma.
 */
export async function postAlternates(post: Post) {
  const key = postKey(post)
  const siblings = await getCollection('blog', (p) => postKey(p) === key)
  const paths: Partial<Record<Locale, string>> = {}
  for (const locale of locales) {
    const match = siblings.find((p) => postLocale(p) === locale)
    if (match) paths[locale] = postPath(match)
  }
  return paths
}

/**
 * Partes da serie do post, em ordem, no mesmo idioma. Vazio se o post nao
 * for de uma serie.
 */
export async function getSeriesParts(post: Post) {
  const series = post.data.series
  if (!series) return []
  const posts = await getPosts(postLocale(post))
  return posts
    .filter((p) => p.data.series?.id === series.id)
    .sort((a, b) => a.data.series!.part - b.data.series!.part)
}

/**
 * Posts relacionados, no mesmo idioma. Primeiro os escolhidos no `related`
 * do frontmatter (pela chave do arquivo, na ordem dada); o que faltar ate
 * `limit` sai das tags em comum, desempatando pelo mais recente. Outras
 * partes da mesma serie ficam de fora do preenchimento automatico, porque ja
 * aparecem na navegacao da serie.
 */
export async function getRelatedPosts(post: Post, limit = 3) {
  const posts = await getPosts(postLocale(post))
  const others = posts.filter((p) => p.id !== post.id)
  const byKey = new Map(others.map((p) => [postKey(p), p]))

  const picked: Post[] = []
  for (const key of post.data.related ?? []) {
    const match = byKey.get(key)
    if (!match) {
      throw new Error(
        `Post "${post.id}": o related "${key}" nao existe em ${postLocale(post)}/.`,
      )
    }
    if (!picked.includes(match)) picked.push(match)
  }

  const tags = new Set(post.data.tags ?? [])
  const seriesId = post.data.series?.id
  const scored = others
    .filter((p) => !picked.includes(p))
    .filter((p) => !seriesId || p.data.series?.id !== seriesId)
    .map((p) => ({
      post: p,
      shared: (p.data.tags ?? []).filter((tag) => tags.has(tag)).length,
    }))
    .filter(({ shared }) => shared > 0)
    // `posts` ja vem do mais recente ao mais antigo e o sort e estavel.
    .sort((a, b) => b.shared - a.shared)

  return [...picked, ...scored.map(({ post }) => post)].slice(0, limit)
}

export function parsePostDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** "05 Mar 2026" no idioma pedido; `withYear: false` omite o ano. */
export function formatPostDate(
  value: string,
  locale: Locale,
  { withYear = true } = {},
) {
  const date = parsePostDate(value)
  const day = String(date.getDate()).padStart(2, '0')
  const month = ui[locale].months[date.getMonth()]
  return withYear ? `${day} ${month} ${date.getFullYear()}` : `${day} ${month}`
}

/** Tempo de leitura em minutos (media de 200 palavras por minuto). */
export function readingTime(body: string | undefined) {
  const words = (body ?? '').trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
