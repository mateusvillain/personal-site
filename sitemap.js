import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const SITE_URL = 'https://mateusvillain.com'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.resolve(__dirname, 'dist')

const ignoredFiles = ['404.html', 'sitemap.xml']

// função recursiva para pegar todos os html
function getAllHtmlFiles(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  let files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relativePath = path.join(basePath, entry.name)

    if (entry.isDirectory()) {
      files = files.concat(getAllHtmlFiles(fullPath, relativePath))
    } else if (
      entry.name.endsWith('.html') &&
      !ignoredFiles.includes(entry.name)
    ) {
      files.push(relativePath)
    }
  }

  return files
}

// URLs sempre com barra final, igual aos canonicals e hreflangs das páginas
function toUrl(file) {
  if (file === 'index.html') return '/'

  if (file.endsWith('/index.html')) {
    return `/${file.replace('/index.html', '')}/`
  }

  return `/${file.replace('.html', '')}/`
}

// Lê os <link rel="alternate" hreflang> que cada página já declara no <head>,
// para o sitemap repetir exatamente os mesmos pares de idioma.
function getAlternates(file) {
  const html = fs.readFileSync(path.join(DIST_DIR, file), 'utf8')
  const links = []
  const pattern =
    /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g

  let match
  while ((match = pattern.exec(html)) !== null) {
    links.push({ hreflang: match[1], href: match[2] })
  }

  return links
}

function getPriority(url) {
  const path = url.replace(/^\/pt(?=\/|$)/, '') || '/'
  if (path === '/') return '1.0'
  if (path.startsWith('/blog')) return '0.8'
  if (path.startsWith('/case/')) return '0.9'
  return '0.7'
}

const escapeXml = (value) => value.replace(/&/g, '&amp;')

const pages = getAllHtmlFiles(DIST_DIR).map((file) => ({
  url: toUrl(file),
  alternates: getAlternates(file),
}))

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map(
    ({ url, alternates }) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <priority>${getPriority(url)}</priority>${alternates
      .map(
        ({ hreflang, href }) => `
    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${escapeXml(href)}" />`,
      )
      .join('')}
  </url>
`,
  )
  .join('')}
</urlset>`

fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemap.trim())

console.log('sitemap.xml gerado com sucesso!')
