import type { Dictionary } from './ui'

/** Textos da listagem e da pagina de post do blog. */
const en = {
  metaTitle: 'Blog - Mateus Villain',
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
}

const pt: typeof en = {
  metaTitle: 'Blog - Mateus Villain',
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
}

export const blog: Dictionary<typeof en> = { en, pt }
