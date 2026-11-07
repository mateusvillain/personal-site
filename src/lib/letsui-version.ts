// Versao publicada do @lets-ui/components, buscada no build. Antes vinha do
// navegador e a consulta ao npm entrava na cadeia critica da home.
// Uma unica consulta por build, compartilhada entre as paginas.
let request: Promise<string | null> | undefined

export function getLetsUiVersion(): Promise<string | null> {
  request ??= fetch('https://registry.npmjs.org/@lets-ui/components/latest')
    .then((res) => (res.ok ? res.json() : null))
    .then((payload) => payload?.version ?? null)
    .catch(() => null)
  return request
}
