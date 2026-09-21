import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.join(__dirname, 'dist')
const outputPath = path.join(distPath, 'robots.txt')

const SITE_URL = 'https://www.mateusvillain.com'

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      getAllHtmlFiles(fullPath, fileList)
    } else if (file.endsWith('.html')) {
      fileList.push(fullPath)
    }
  })

  return fileList
}

function generateRobots() {
  if (!fs.existsSync(distPath)) {
    console.error('Pasta dist/ não encontrada.')
    process.exit(1)
  }

  const htmlFiles = getAllHtmlFiles(distPath)

  if (htmlFiles.length === 0) {
    console.warn('Nenhuma página HTML encontrada no dist/.')
  }

  // Tudo liberado, inclusive crawlers de IA (busca e treino): o site vive
  // de ser encontrado e citado. Os agentes listados abaixo já estariam
  // cobertos pelo `*`; ficam explícitos para documentar a decisão.
  const aiAgents = [
    'GPTBot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'ClaudeBot',
    'Claude-SearchBot',
    'Claude-User',
    'anthropic-ai',
    'PerplexityBot',
    'Perplexity-User',
    'Google-Extended',
    'Applebot-Extended',
    'Bytespider',
    'CCBot',
    'meta-externalagent',
    'Amazonbot',
    'DuckAssistBot',
    'YouBot',
  ]

  const content = `User-agent: *
Allow: /

${aiAgents.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n')}

Sitemap: ${SITE_URL}/sitemap.xml
`

  fs.writeFileSync(outputPath, content)
  console.log('✔ robots.txt gerado com sucesso em dist/')
}

generateRobots()
