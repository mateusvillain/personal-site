/**
 * Reduzir movimento. O ThemeInit marca `html[data-motion="reduce"]` quando o
 * sistema pede (`prefers-reduced-motion`) ou o visitante escolheu nas
 * Configuracoes, e mantem o atributo em dia. Tudo olha so para ele.
 *
 * Mesmo formato de um MediaQueryList (`.matches`), lido na hora.
 */
export const reduceMotion = {
  get matches() {
    return document.documentElement.dataset.motion === 'reduce'
  },
}

/** So a preferencia do sistema (para travar a opcao nas Configuracoes). */
export const systemReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
