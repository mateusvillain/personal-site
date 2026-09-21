/**
 * Configuracao central de idiomas.
 *
 *   /      -> ingles (padrao, sem prefixo)
 *   /pt/   -> portugues brasileiro
 *
 * Todas as rotas em `src/pages/[...locale]/` recebem o parametro `locale`
 * (undefined para o idioma padrao). Use os helpers daqui para montar
 * links, canonicals e alternates em vez de concatenar strings na mao.
 */
export const locales = ['en', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/** Codigo BCP 47 usado em <html lang>, hreflang e og:locale. */
export const htmlLang: Record<Locale, string> = {
  en: 'en',
  pt: 'pt-BR',
}

export const ogLocale: Record<Locale, string> = {
  en: 'en_US',
  pt: 'pt_BR',
}

/** Rotas estaticas: uma entrada por idioma para `getStaticPaths`. */
export function localeStaticPaths() {
  return locales.map((locale) => ({
    params: { locale: locale === defaultLocale ? undefined : locale },
    props: { locale },
  }))
}

/** Normaliza o parametro `[...locale]` da rota para um Locale valido. */
export function localeFromParam(param: string | undefined): Locale {
  if (!param) return defaultLocale
  return (locales as readonly string[]).includes(param)
    ? (param as Locale)
    : defaultLocale
}

/** Prefixo de URL do idioma ('' para o padrao, '/pt' para os demais). */
export function localePrefix(locale: Locale) {
  return locale === defaultLocale ? '' : `/${locale}`
}

/**
 * Monta um caminho localizado. `path` deve ser absoluto e sem prefixo de
 * idioma, ex.: localizePath('/blog/', 'pt') -> '/pt/blog/'.
 */
export function localizePath(path: string, locale: Locale) {
  const clean = path.startsWith('/') ? path : `/${path}`
  const prefix = localePrefix(locale)
  if (clean === '/') return prefix ? `${prefix}/` : '/'
  return `${prefix}${clean}`
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'pt' : 'en'
}

/**
 * Lista de alternates para o <head>: uma entrada por idioma mais o
 * x-default (o idioma padrao). `paths` mapeia cada idioma ao caminho da
 * mesma pagina naquele idioma; quando a pagina existe com o mesmo caminho
 * nos dois idiomas, basta passar o caminho base.
 */
export function alternates(
  paths: string | Partial<Record<Locale, string>>,
): { hreflang: string; path: string }[] {
  const byLocale: Partial<Record<Locale, string>> =
    typeof paths === 'string'
      ? Object.fromEntries(locales.map((l) => [l, localizePath(paths, l)]))
      : paths

  const list = locales
    .filter((l) => byLocale[l])
    .map((l) => ({ hreflang: htmlLang[l], path: byLocale[l]! }))

  const fallback = byLocale[defaultLocale]
  if (fallback) list.push({ hreflang: 'x-default', path: fallback })

  return list
}
