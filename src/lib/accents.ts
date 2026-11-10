import type { Locale } from '../i18n/config'
import data from '../data/accents.json'

/**
 * Cores principais das Configuracoes. Fonte unica: src/data/accents.json
 * (as escalas viram SCSS pelo scripts/build-accents.mjs). O `id` vira
 * `html[data-accent]`; o padrao e o proprio brand, sem atributo.
 */
export const DEFAULT_ACCENT: string = data.default

export type Accent = {
  id: string
  name: Record<Locale, string>
  light: string[]
  dark: string[]
}

export const accents: Accent[] = data.accents

export const accentIds = accents.map((accent) => accent.id)
