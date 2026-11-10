import type { Locale } from '../i18n/config'

/**
 * Cores principais das Configuracoes. O `id` vira `html[data-accent]` e
 * precisa existir em src/sass/general/_accents.scss (o azul padrao nao tem
 * escala la: e o proprio brand, sem atributo).
 */
export const DEFAULT_ACCENT = 'blue'

export const accents: { id: string; name: Record<Locale, string> }[] = [
  { id: 'blue', name: { pt: 'Azul', en: 'Blue' } },
  { id: 'violet', name: { pt: 'Violeta', en: 'Violet' } },
  { id: 'magenta', name: { pt: 'Magenta', en: 'Magenta' } },
  { id: 'red', name: { pt: 'Vermelho', en: 'Red' } },
  { id: 'orange', name: { pt: 'Laranja', en: 'Orange' } },
  { id: 'green', name: { pt: 'Verde', en: 'Green' } },
  { id: 'teal', name: { pt: 'Petróleo', en: 'Teal' } },
]
