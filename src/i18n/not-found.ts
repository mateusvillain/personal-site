import type { Dictionary } from './ui'

/** Textos da pagina 404. */
const en = {
  metaTitle: 'Page not found - Mateus Villain',
  title: 'Error 404',
  description: 'The page you are looking for does not exist. To continue:',
  items: [
    'Return to the homepage.',
    'Access one of my projects',
    'Get in touch: contato@mateusvillain.com',
  ],
  homeLink: 'Home',
  caseLink: 'Locaweb Design System',
}

const pt: typeof en = {
  metaTitle: 'Página não encontrada - Mateus Villain',
  title: 'Erro 404',
  description: 'A página que você está buscando não existe. Para continuar:',
  items: [
    'Retorne à página inicial.',
    'Acesse um dos meus projetos',
    'Entre em contato via contato@mateusvillain.com',
  ],
  homeLink: 'Início',
  caseLink: 'Locaweb Design System',
}

export const notFound: Dictionary<typeof en> = { en, pt }
