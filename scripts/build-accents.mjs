/**
 * Gera src/sass/general/_accents.generated.scss a partir de
 * src/data/accents.json, a fonte unica das cores principais (Configuracoes >
 * Cor principal). Roda antes do Sass em `build:assets`; o arquivo gerado nao
 * vai para o git, como o public/style.css.
 *
 * Valida o JSON: ids unicos e em [a-z], nomes em pt e en, 8 tons por tema em
 * #rrggbb e o padrao presente na lista. Erro aqui para o build.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const SOURCE = new URL('../src/data/accents.json', import.meta.url)
const TARGET = new URL('../src/sass/general/_accents.generated.scss', import.meta.url)
const HEX = /^#[0-9a-f]{6}$/

const data = JSON.parse(readFileSync(SOURCE, 'utf8'))
const fail = (message) => {
  throw new Error(`accents.json: ${message}`)
}

const ids = new Set()
for (const accent of data.accents) {
  if (!/^[a-z]{1,20}$/.test(accent.id)) fail(`id invalido "${accent.id}"`)
  if (ids.has(accent.id)) fail(`id repetido "${accent.id}"`)
  ids.add(accent.id)
  if (!accent.name?.pt || !accent.name?.en) fail(`"${accent.id}" sem nome em pt e en`)
  for (const theme of ['light', 'dark']) {
    const scale = accent[theme]
    if (!Array.isArray(scale) || scale.length !== 8 || !scale.every((c) => HEX.test(c))) {
      fail(`"${accent.id}" precisa de 8 tons #rrggbb em "${theme}"`)
    }
  }
}
if (!ids.has(data.default)) fail(`padrao "${data.default}" fora da lista`)

const list = (colors) => `(${colors.join(', ')})`
const entries = data.accents
  .map((a) => `  '${a.id}': (\n    light: ${list(a.light)},\n    dark: ${list(a.dark)},\n  ),`)
  .join('\n')

writeFileSync(
  TARGET,
  `// GERADO por scripts/build-accents.mjs a partir de src/data/accents.json.
// Nao edite aqui: mude o JSON.

$default: '${data.default}';

$accents: (
${entries}
);
`,
)

console.log(`accents: ${ids.size} cores -> ${TARGET.pathname.split('/').pop()}`)
