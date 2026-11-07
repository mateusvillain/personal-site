import type { Dictionary } from './ui'

/** Textos da listagem e da pagina de post do blog. */
const en = {
  metaTitle: 'Blog',
  metaDescription:
    'Practical content on design systems, design tokens, UI and UX to build more consistent, scalable and user-centered digital products.',
  title: 'Blog',
  readTime: (minutes: number) => `${minutes} min read`,
  minutes: 'minutes',
  copyLink: 'Copy link',
  linkCopied: 'Link copied!',
  copyFailed: 'Could not copy the link.',
  shareLinkedin: 'Share on LinkedIn (opens in a new tab)',
  shareX: 'Share on X (opens in a new tab)',
  copyCode: 'Copy',
  copyCodeLabel: 'Copy code',
  codeCopied: 'Copied!',
  copyError: 'Error',
  topicsLabel: 'Topics',
  postTopicsLabel: 'Topics of this post',
  relatedTitle: 'Related posts',
  seriesPart: (part: number, total: number, name: string) =>
    `Part ${part} of ${total} of the series ${name}`,
  seriesCurrent: 'you are here',
  topicTitle: (name: string) => `Posts about ${name}`,
  topicMetaTitle: (name: string) => `${name} · Blog`,
  /** Nome de cada serie, pelo `series.id` do frontmatter. */
  series: {
    'guia-design-tokens': 'The Ultimate Guide to Design Tokens',
  } as Record<string, string>,
}

const pt: typeof en = {
  metaTitle: 'Blog',
  metaDescription:
    'Conteúdos práticos sobre design system, design tokens, UI e UX para criar produtos digitais mais consistentes, escaláveis e centrados no usuário.',
  title: 'Blog',
  readTime: (minutes: number) => `${minutes} min de leitura`,
  minutes: 'minutos',
  copyLink: 'Copiar link',
  linkCopied: 'Link copiado!',
  copyFailed: 'Não foi possível copiar o link.',
  shareLinkedin: 'Compartilhar no LinkedIn (abre em nova aba)',
  shareX: 'Compartilhar no X (abre em nova aba)',
  copyCode: 'Copiar',
  copyCodeLabel: 'Copiar código',
  codeCopied: 'Copiado!',
  copyError: 'Erro',
  topicsLabel: 'Temas',
  postTopicsLabel: 'Temas deste post',
  relatedTitle: 'Posts relacionados',
  seriesPart: (part: number, total: number, name: string) =>
    `Parte ${part} de ${total} da série ${name}`,
  seriesCurrent: 'você está aqui',
  topicTitle: (name: string) => `Posts sobre ${name}`,
  topicMetaTitle: (name: string) => `${name} · Blog`,
  series: {
    'guia-design-tokens': 'O Guia Definitivo dos Design Tokens',
  },
}

export const blog: Dictionary<typeof en> = { en, pt }
