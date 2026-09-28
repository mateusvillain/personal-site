import type { Dictionary } from './ui'

/** Textos da pagina de recursos (sites recomendados). */
const en = {
  metaTitle: 'Resources - Mateus Villain',
  metaDescription:
    'Sites Mateus Villain recommends on design systems, UI and product design.',
  title: 'Resources',
  columns: {
    name: 'Name',
    site: 'Site',
  },
}

const pt: typeof en = {
  metaTitle: 'Recursos - Mateus Villain',
  metaDescription:
    'Sites que Mateus Villain recomenda sobre design system, UI e design de produto.',
  title: 'Recursos',
  columns: {
    name: 'Nome',
    site: 'Site',
  },
}

export const resources: Dictionary<typeof en> = { en, pt }
