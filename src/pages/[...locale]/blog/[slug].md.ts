import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'
import { defaultLocale, htmlLang, type Locale } from '../../../i18n/config'
import {
  postAlternates,
  postLocale,
  postPath,
  postSlug,
  type Post,
} from '../../../lib/posts'
import { AUTHOR } from '../../../lib/seo'

/**
 * Versao em markdown de cada post (`/blog/<slug>.md`), para agentes e LLMs
 * que preferem texto limpo ao HTML. Linkada no `llms.txt` e no <head> do
 * post (`rel="alternate" type="text/markdown"`).
 */
export async function getStaticPaths() {
  const posts = await getCollection('blog')

  return posts.map((post) => {
    const locale = postLocale(post)
    return {
      params: {
        locale: locale === defaultLocale ? undefined : locale,
        slug: postSlug(post),
      },
      props: { post, locale },
    }
  })
}

export async function GET(context: APIContext) {
  const { post, locale } = context.props as { post: Post; locale: Locale }
  const site = context.site!
  const url = new URL(postPath(post), site).href

  const alternates = await postAlternates(post)
  const translations = Object.entries(alternates)
    .filter(([l]) => l !== locale)
    .map(
      ([l, path]) => `${htmlLang[l as Locale]}: ${new URL(path!, site).href}`,
    )

  const header = [
    `# ${post.data.title}`,
    '',
    `> ${post.data.description}`,
    '',
    `- Author: ${AUTHOR.name} (${AUTHOR.url})`,
    `- Published: ${post.data.date}`,
    `- Language: ${htmlLang[locale]}`,
    `- Canonical: ${url}`,
    ...(translations.length
      ? [`- Also available in: ${translations.join(', ')}`]
      : []),
    ...(post.data.tags?.length ? [`- Tags: ${post.data.tags.join(', ')}`] : []),
    '',
    '---',
    '',
    '',
  ].join('\n')

  return new Response(header + (post.body ?? '').trim() + '\n', {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
