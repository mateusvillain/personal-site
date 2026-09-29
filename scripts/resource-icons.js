// Baixa o favicon de cada site de `src/content/resources.yaml` e salva como
// PNG 64x64 no caminho do `icon` (dentro de `public/`).
//
//   npm run resources:icons            -> so os icones que ainda nao existem
//   npm run resources:icons -- --force -> refaz todos
//
// Ordem de preferencia: SVG, maior PNG declarado (icon/apple-touch-icon),
// .ico e, por ultimo, /favicon.ico.

import sharp from 'sharp'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.resolve('src/content/resources.yaml')
const PUBLIC_DIR = path.resolve('public')
const SIZE = 64
const force = process.argv.includes('--force')

const resources = yaml.load(fs.readFileSync(DATA_FILE, 'utf8'))

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`${res.status} em ${url}`)
  return res
}

function attr(tag, name) {
  return tag.match(new RegExp(`${name}=["']([^"']*)["']`, 'i'))?.[1]
}

// Candidatos declarados no <head>, do melhor para o pior.
function candidates(html, baseUrl) {
  const found = []
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const rel = attr(tag, 'rel')?.toLowerCase() ?? ''
    const href = attr(tag, 'href')
    if (!href || !/\bicon\b|apple-touch-icon/.test(rel)) continue

    const url = new URL(href.replace(/&amp;/g, '&'), baseUrl).href
    const type = attr(tag, 'type') ?? ''
    const size = Math.max(
      0,
      ...(attr(tag, 'sizes') ?? '').split(/\s+/).map((s) => parseInt(s, 10) || 0),
    )
    const isSvg = type.includes('svg') || /\.svg(\?|$)/i.test(url)
    const isIco = type.includes('icon') || /\.ico(\?|$)/i.test(url)
    const isApple = rel.includes('apple-touch-icon')

    const score = isSvg ? 1e6 : isIco ? 1 : (size || (isApple ? 180 : 32)) + 10
    found.push({ url, score })
  }
  found.push({ url: new URL('/favicon.ico', baseUrl).href, score: 0 })
  return found.sort((a, b) => b.score - a.score)
}

// sharp nao le .ico; extrai a maior imagem PNG embutida no arquivo.
function pngFromIco(buffer) {
  if (buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    return buffer
  }
  const images = []
  for (let i = 0; i < buffer.readUInt16LE(4); i++) {
    const entry = 6 + i * 16
    const size = buffer[entry] || 256
    const length = buffer.readUInt32LE(entry + 8)
    const offset = buffer.readUInt32LE(entry + 12)
    images.push({ size, data: buffer.subarray(offset, offset + length) })
  }
  const png = images
    .filter(({ data }) => data.readUInt32BE(0) === 0x89504e47)
    .sort((a, b) => b.size - a.size)[0]
  if (!png) throw new Error('.ico sem PNG embutido (formato BMP)')
  return png.data
}

for (const [id, site] of Object.entries(resources)) {
  if (!site.icon) {
    console.log(`- ${id}: sem campo icon, pulando`)
    continue
  }
  const target = path.join(PUBLIC_DIR, site.icon)
  if (fs.existsSync(target) && !force) {
    console.log(`- ${id}: ${site.icon} ja existe`)
    continue
  }

  try {
    const page = await get(site.url)
    const list = candidates(await page.text(), page.url)

    let saved = false
    for (const { url } of list) {
      try {
        const buffer = Buffer.from(await (await get(url)).arrayBuffer())
        fs.mkdirSync(path.dirname(target), { recursive: true })
        await sharp(pngFromIco(buffer), { density: 300 })
          .resize(SIZE, SIZE, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toFile(target)
        console.log(`✓ ${id}: ${url}`)
        saved = true
        break
      } catch {
        // tenta o proximo candidato
      }
    }
    if (!saved) console.warn(`✗ ${id}: nenhum favicon utilizavel`)
  } catch (error) {
    console.warn(`✗ ${id}: ${error.message}`)
  }
}
