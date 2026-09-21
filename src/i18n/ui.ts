import type { Locale } from './config'

/**
 * Dicionario de textos compartilhados (layout, cabecalho, rodape do blog,
 * formulario de newsletter...). Textos especificos de uma pagina ficam no
 * arquivo daquela pagina dentro de `src/i18n/`.
 */
export type Dictionary<T> = Record<Locale, T>

/** Retorna as strings do idioma pedido. */
export function t<T>(dictionary: Dictionary<T>, locale: Locale): T {
  return dictionary[locale]
}

const en = {
  siteName: 'Mateus Villain',
  siteDescription:
    'Mateus Villain is a product designer, design system specialist, teacher and author of the book Design System Beyond the Layout.',
  keywords:
    'Design System, User Interface, UI, User Experience, UX, Accessibility, Handoff',
  skipLink: 'Skip to main content',
  home: 'Home',
  blog: 'Blog',
  themeToggle: 'Toggle theme',
  langSwitch: {
    /** Rotulo do link que leva para a versao no outro idioma. */
    label: 'PT',
    /** Nome acessivel completo do link. */
    ariaLabel: 'Ler em português',
  },
  newWindow: '(opens in a new tab)',
  newsletter: {
    title: 'Subscribe to the newsletter',
    description: 'Get the best content straight to your inbox',
    emailLabel: 'E-mail',
    emailPlaceholder: 'you@email.com',
    required: 'Required field.',
    submit: 'Subscribe',
    submitting: 'Sending...',
    errorTitle: 'We could not send your subscription.',
    errorContent:
      'It looks like the system is not working right now. Please try again in a few minutes.',
    errorGeneric: 'Could not send your subscription right now.',
    successTitle: 'Confirmation e-mail sent!',
    successContent:
      'Check your inbox and spam folder to confirm your subscription.',
  },
  author: {
    bio: 'Mateus Villain is a product designer, design system specialist, teacher, and author of the book Design System Beyond the Layout, published by Casa do Código.',
    linkedin: 'LinkedIn, opens in a new tab',
    github: 'GitHub, opens in a new tab',
    x: 'X, opens in a new tab',
  },
  months: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
}

const pt: typeof en = {
  siteName: 'Mateus Villain',
  siteDescription:
    'Mateus Villain é product designer, especialista em design system, professor e autor do livro Design System além do layout.',
  keywords:
    'Design System, User Interface, UI, User Experience, UX, Acessibilidade, Handoff',
  skipLink: 'Ir para o conteúdo principal',
  home: 'Início',
  blog: 'Blog',
  themeToggle: 'Alternar tema',
  langSwitch: {
    label: 'EN',
    ariaLabel: 'Read in English',
  },
  newWindow: '(abre em nova aba)',
  newsletter: {
    title: 'Assine a newsletter',
    description: 'Receba os melhores conteúdos direto no seu e-mail',
    emailLabel: 'E-mail',
    emailPlaceholder: 'seu@email.com',
    required: 'Campo obrigatório.',
    submit: 'Assinar',
    submitting: 'Enviando...',
    errorTitle: 'Não foi possível enviar sua inscrição.',
    errorContent:
      'Parece que o sistema não está funcionando no momento. Tente novamente em alguns minutos.',
    errorGeneric: 'Não foi possível enviar sua inscrição agora.',
    successTitle: 'E-mail de confirmação enviado!',
    successContent:
      'Confira sua caixa de entrada e spam para confirmar sua inscrição.',
  },
  author: {
    bio: 'Mateus Villain é product designer, especialista em design system, professor, e autor do livro Design System além do layout, pela Casa do Código.',
    linkedin: 'LinkedIn, nova janela',
    github: 'GitHub, nova janela',
    x: 'X, nova janela',
  },
  months: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
}

export const ui: Dictionary<typeof en> = { en, pt }
export type UiStrings = typeof en
