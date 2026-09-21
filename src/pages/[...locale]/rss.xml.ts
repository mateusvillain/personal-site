import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import {
  htmlLang,
  localeStaticPaths,
  localizePath,
  type Locale,
} from '../../i18n/config'
import { ui } from '../../i18n/ui'
import { blog } from '../../i18n/blog'
import { getPosts, parsePostDate, postPath } from '../../lib/posts'
import { AUTHOR } from '../../lib/seo'

/**
 * Feed RSS do blog, um por idioma:
 *
 *   /rss.xml      -> posts em ingles
 *   /pt/rss.xml   -> posts em portugues
 */
export function getStaticPaths() {
  return localeStaticPaths()
}

export async function GET(context: APIContext) {
  const { locale } = context.props as { locale: Locale }
  const strings = ui[locale]
  const posts = await getPosts(locale)

  return rss({
    title: `${strings.siteName} - ${strings.blog}`,
    description: blog[locale].metaDescription,
    site: new URL(localizePath('/', locale), context.site).href,
    customData: `<language>${htmlLang[locale]}</language>`,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: postPath(post),
      pubDate: parsePostDate(post.data.date),
      author: `${AUTHOR.email} (${AUTHOR.name})`,
      categories: post.data.tags,
    })),
  })
}
