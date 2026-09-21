import { htmlLang, type Locale } from '../i18n/config'

/**
 * Dados estruturados (JSON-LD, schema.org) usados no <head>. Os builders
 * daqui recebem URLs absolutas; quem chama resolve com `Astro.site`.
 */

export const SITE_URL = 'https://www.mateusvillain.com'

export const AUTHOR = {
  name: 'Mateus Villain',
  url: SITE_URL,
  image: `${SITE_URL}/img/mtsvlln.jpg`,
  email: 'contato@mateusvillain.com',
  sameAs: [
    'https://www.linkedin.com/in/mateusvillain/',
    'https://github.com/mateusvillain',
    'https://x.com/mateusvillain',
    'https://mastodon.social/@mateusvillain',
    'https://cursos.alura.com.br/user/mateusvillain',
  ],
}

const person = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: AUTHOR.name,
  url: AUTHOR.url,
  image: AUTHOR.image,
  email: AUTHOR.email,
  jobTitle: 'Product Designer',
  worksFor: { '@type': 'Organization', name: 'Locaweb' },
  sameAs: AUTHOR.sameAs,
}

/** Home: quem e o dono do site + o site em si (com nome e idioma). */
export function homeJsonLd(locale: Locale, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { ...person, description },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: AUTHOR.name,
        inLanguage: htmlLang[locale],
        publisher: { '@id': `${SITE_URL}/#person` },
      },
    ],
  }
}

interface BlogPostingInput {
  locale: Locale
  url: string
  title: string
  description: string
  image: string
  datePublished: string
  tags?: string[]
  wordCount?: number
}

/** Post do blog. `datePublished` no formato YYYY-MM-DD. */
export function blogPostingJsonLd(input: BlogPostingInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': input.url,
    mainEntityOfPage: input.url,
    url: input.url,
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    inLanguage: htmlLang[input.locale],
    keywords: input.tags?.join(', '),
    wordCount: input.wordCount,
    author: { '@id': `${SITE_URL}/#person`, ...person },
    publisher: { '@id': `${SITE_URL}/#person` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  }
}

/** Trilha de navegacao (Home > Blog > Post), uma entrada por nivel. */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
