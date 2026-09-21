import type { APIContext } from 'astro'
import { locales, localizePath, type Locale } from '../i18n/config'
import { ui } from '../i18n/ui'
import { home } from '../i18n/home'
import { mentorship } from '../i18n/mentorship'
import { caseLocaweb } from '../i18n/case-locaweb'
import { getPosts, postPath, postSlug } from '../lib/posts'
import { AUTHOR } from '../lib/seo'

/**
 * `/llms.txt` (https://llmstxt.org): resumo do site em markdown para
 * agentes e LLMs, com links para as paginas principais e para a versao em
 * markdown de cada post. Um arquivo so, com uma secao por idioma.
 */
const sectionTitle: Record<Locale, string> = {
  en: 'English',
  pt: 'Português (Brasil)',
}

const pageLabels: Record<Locale, { blog: string; posts: string }> = {
  en: { blog: 'Blog index', posts: 'Posts (markdown)' },
  pt: { blog: 'Índice do blog', posts: 'Posts (markdown)' },
}

export async function GET(context: APIContext) {
  const site = context.site!
  const abs = (path: string) => new URL(path, site).href

  const intro = [
    `# ${AUTHOR.name}`,
    '',
    `> ${ui.en.siteDescription}`,
    '',
    'Personal site and blog of Mateus Villain, a Brazilian product designer specialized in design systems, design tokens and DesignOps. Content is available in English (default, no prefix) and Brazilian Portuguese (`/pt/`). Blog posts are written by the author; each post has a plain-markdown version linked below.',
    '',
    `- Contact: ${AUTHOR.email}`,
    `- Profiles: ${AUTHOR.sameAs.join(', ')}`,
    `- Sitemap: ${abs('/sitemap.xml')}`,
    '',
  ]

  const sections: string[] = []

  for (const locale of locales) {
    const strings = ui[locale]
    const labels = pageLabels[locale]
    const posts = await getPosts(locale)

    sections.push(
      `## ${sectionTitle[locale]}`,
      '',
      `- [${home[locale].metaTitle}](${abs(localizePath('/', locale))}): ${strings.siteDescription}`,
      `- [${mentorship[locale].title}](${abs(localizePath('/mentorship/', locale))}): ${mentorship[locale].metaDescription}`,
      `- [${caseLocaweb[locale].title}](${abs(localizePath('/case/locaweb-design-system/', locale))}): ${caseLocaweb[locale].metaDescription}`,
      `- [${labels.blog}](${abs(localizePath('/blog/', locale))})`,
      `- [RSS](${abs(localizePath('/rss.xml', locale))})`,
      '',
      `### ${labels.posts}`,
      '',
      ...posts.map(
        (post) =>
          `- [${post.data.title}](${abs(localizePath(`/blog/${postSlug(post)}.md`, locale))}): ${post.data.description} (${post.data.date}; HTML: ${abs(postPath(post))})`,
      ),
      '',
    )
  }

  return new Response([...intro, ...sections].join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
