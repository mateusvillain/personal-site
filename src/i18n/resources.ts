import type { Dictionary } from './ui'

/**
 * Categorias aceitas no campo `category` de `src/content/resources.yaml`, na
 * ordem em que aparecem nos filtros. O nome exibido de cada uma fica em
 * `categories`, abaixo, em cada idioma.
 */
export const resourceCategories = [
  'components',
  'inspiration',
  'people',
  'companies',
] as const

export type ResourceCategory = (typeof resourceCategories)[number]

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
  filterLabel: 'Filter by category',
  allCategories: 'All',
  categories: {
    components: 'Components',
    inspiration: 'Inspiration',
    people: 'People',
    companies: 'Companies',
  } satisfies Record<ResourceCategory, string>,
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
  filterLabel: 'Filtrar por categoria',
  allCategories: 'Todos',
  categories: {
    components: 'Componentes',
    inspiration: 'Inspiração',
    people: 'Pessoas',
    companies: 'Empresas',
  },
}

export const resources: Dictionary<typeof en> = { en, pt }
