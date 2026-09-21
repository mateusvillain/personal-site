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
