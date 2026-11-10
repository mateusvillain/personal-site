/**
 * Reduzir movimento: vale a preferencia do sistema
 * (`prefers-reduced-motion`) ou a do site (Configuracoes, ver
 * SiteSettings.astro), que fica em `html[data-motion="reduce"]`. Le na hora,
 * entao trocar a opcao com a pagina aberta ja vale para a proxima animacao.
 *
 * Mesmo formato de um MediaQueryList (`.matches`) para trocar o
 * `matchMedia(...)` sem mexer no resto do codigo.
 */
const system = window.matchMedia('(prefers-reduced-motion: reduce)')

export const reduceMotion = {
  get matches() {
    return document.documentElement.dataset.motion === 'reduce' || system.matches
  },
}
