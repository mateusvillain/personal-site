import { localizePath, locales, type Locale } from '../i18n/config'
import { getPosts, type Post } from './posts'

/**
 * Temas do blog com pagina propria (/blog/tag/<slug>/). Nem toda tag vira
 * pagina: so as daqui, e so no idioma em que o tema tiver pelo menos
 * MIN_TOPIC_POSTS posts. Tag com um post so, ou que repete exatamente outro
 * tema, renderia uma pagina rasa e duplicada; essas ficam so nos metadados.
 *
 * `tag` e o valor no frontmatter do post naquele idioma; `slug` e o segmento
 * da URL. A chave do objeto liga as versoes do mesmo tema (hreflang e troca
 * de idioma), como o nome do arquivo faz com os posts.
 */
export const MIN_TOPIC_POSTS = 2

interface TopicLocale {
  tag: string
  slug: string
  name: string
  /** Paragrafo de abertura da pagina e meta description (120-155 caracteres). */
  description: string
}

export const topics: Record<string, Record<Locale, TopicLocale>> = {
  'design-system': {
    en: {
      tag: 'design system',
      slug: 'design-system',
      name: 'Design system',
      description:
        'Articles on building and scaling design systems: tokens, components, documentation, governance and the use of AI in everyday work.',
    },
    pt: {
      tag: 'design system',
      slug: 'design-system',
      name: 'Design system',
      description:
        'Artigos sobre como construir e escalar um design system: tokens, componentes, documentação, governança e o uso de IA no dia a dia.',
    },
  },
  ai: {
    en: {
      tag: 'ai',
      slug: 'ai',
      name: 'AI',
      description:
        'Articles on using AI in design work: Claude, MCP and agents applied to Figma, design systems and the automation of repetitive tasks.',
    },
    pt: {
      tag: 'ia',
      slug: 'ia',
      name: 'IA',
      description:
        'Artigos sobre o uso de IA no trabalho de design: Claude, MCP e agentes aplicados ao Figma, a design systems e à automação de tarefas.',
    },
  },
}

export type TopicId = keyof typeof topics

export interface Topic extends TopicLocale {
  id: TopicId
  locale: Locale
  path: string
  posts: Post[]
}

/** Caminho da pagina do tema, ja com o prefixo do idioma. */
export function topicPath(slug: string, locale: Locale) {
  return localizePath(`/blog/tag/${slug}/`, locale)
}

/**
 * Temas que tem pagina no idioma pedido (pelo menos MIN_TOPIC_POSTS posts),
 * cada um com seus posts do mais recente ao mais antigo. Na ordem de
 * `topics`.
 */
export async function getTopics(locale: Locale): Promise<Topic[]> {
  const posts = await getPosts(locale)
  return Object.entries(topics)
    .map(([id, byLocale]) => {
      const topic = byLocale[locale]
      return {
        ...topic,
        id,
        locale,
        path: topicPath(topic.slug, locale),
        posts: posts.filter((p) => p.data.tags?.includes(topic.tag)),
      }
    })
    .filter((topic) => topic.posts.length >= MIN_TOPIC_POSTS)
}

/** Temas com pagina de que o post faz parte. */
export async function getPostTopics(post: Post, locale: Locale) {
  const all = await getTopics(locale)
  return all.filter((topic) => topic.posts.some((p) => p.id === post.id))
}

/** Caminhos do mesmo tema em cada idioma em que ele tem pagina. */
export async function topicAlternates(id: TopicId) {
  const paths: Partial<Record<Locale, string>> = {}
  for (const locale of locales) {
    const match = (await getTopics(locale)).find((t) => t.id === id)
    if (match) paths[locale] = match.path
  }
  return paths
}
