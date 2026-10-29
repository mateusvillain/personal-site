// Gera a capa de SEO (og:image, 1200x675) de cada post do blog, uma por
// idioma, e grava o caminho no `cover` do frontmatter.
//
//   npm run blog:covers                 -> posts sem `cover` e capas ja geradas
//   npm run blog:covers -- <chave>      -> so esse post (pt e en)
//   npm run blog:covers -- --force      -> substitui tambem capas feitas a mao
//
// A capa sai em public/blog/covers/<chave>-<idioma>.png. Capas feitas a mao
// (qualquer `cover` com outro caminho) ficam como estao, a menos que se use
// --force. Rodar de novo depois de mudar o titulo atualiza a imagem.
//
// O texto e desenhado pelo satori, que converte as letras em vetores, entao o
// resultado nao depende das fontes instaladas na maquina. As fontes (Geist,
// licenca OFL) ficam em scripts/fonts/.

import satori from 'satori'
import sharp from 'sharp'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

const BLOG_DIR = path.resolve('src/content/blog')
const COVERS_DIR = path.resolve('public/blog/covers')
const COVERS_URL = '/blog/covers'
const FONTS_DIR = path.resolve('scripts/fonts')
const PHOTO_FILE = path.resolve('public/img/mtsvlln.jpg')
const PHOTO_SIZE = 72
const LOCALES = ['pt', 'en']
const WIDTH = 1200
const HEIGHT = 675
const PADDING_X = 96
const PADDING_Y = 80

const args = process.argv.slice(2)
const force = args.includes('--force')
const onlyKey = args.find((arg) => !arg.startsWith('--'))

const fonts = [
  { name: 'Geist', weight: 400, file: 'Geist-Regular.ttf' },
  { name: 'Geist', weight: 600, file: 'Geist-SemiBold.ttf' },
].map(({ file, ...font }) => ({
  ...font,
  style: 'normal',
  data: fs.readFileSync(path.join(FONTS_DIR, file)),
}))

const h = (type, style, children) => ({ type, props: { style, children } })

// Foto do autor recortada em quadrado e embutida como data URL (o satori nao
// le arquivos). O dobro do tamanho final, para ficar nitida.
const photo = await sharp(PHOTO_FILE)
  .resize(PHOTO_SIZE * 2, PHOTO_SIZE * 2, { fit: 'cover' })
  .jpeg({ quality: 90 })
  .toBuffer()
const photoSrc = `data:image/jpeg;base64,${photo.toString('base64')}`

// Titulos longos encolhem para caber em ate 4 linhas.
function titleSize(title) {
  if (title.length <= 40) return 80
  if (title.length <= 70) return 68
  if (title.length <= 100) return 58
  return 50
}

// Foto no topo, titulo e autor embaixo.
function coverMarkup(title) {
  return h(
    'div',
    {
      // O satori soma o padding por fora da largura e da altura (content-box):
      // sem descontar, o conteudo passa do canvas e e cortado.
      width: WIDTH - PADDING_X * 2,
      height: HEIGHT - PADDING_Y * 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: `${PADDING_Y}px ${PADDING_X}px`,
      backgroundColor: '#fdfdfd',
      fontFamily: 'Geist',
    },
    [
      {
        type: 'img',
        props: {
          src: photoSrc,
          width: PHOTO_SIZE,
          height: PHOTO_SIZE,
          style: { borderRadius: '50%', objectFit: 'cover' },
        },
      },
      h('div', { display: 'flex', flexDirection: 'column', gap: 40 }, [
        h(
          'div',
          {
            display: 'flex',
            // Sem largura fixa o satori nao quebra a linha e o texto vaza.
            width: WIDTH - PADDING_X * 2,
            fontSize: titleSize(title),
            fontWeight: 600,
            lineHeight: 1.12,
            letterSpacing: '-0.025em',
            color: '#1d1d1f',
          },
          title,
        ),
        h(
          'div',
          { display: 'flex', fontSize: 30, fontWeight: 400, color: '#1d1d1f' },
          'Mateus Villain',
        ),
      ]),
    ],
  )
}

async function renderCover(title, file) {
  const svg = await satori(coverMarkup(title), {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  })
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(file)
}

// Le o frontmatter sem reescreve-lo: so a linha do `cover` e tocada, para nao
// mudar a formatacao do resto (aspas, listas de tags...).
function readPost(file) {
  const source = fs.readFileSync(file, 'utf8')
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  if (!match) throw new Error(`Frontmatter nao encontrado em ${file}`)
  return { source, frontmatter: match[1], data: yaml.load(match[1]) }
}

function setCover({ source, frontmatter }, url) {
  const line = `cover: '${url}'`
  const lines = frontmatter.split('\n')
  const coverIndex = lines.findIndex((l) => l.startsWith('cover:'))

  if (coverIndex >= 0) {
    lines[coverIndex] = line
  } else {
    // Mesmo lugar dos outros posts: logo depois do `date`.
    const dateIndex = lines.findIndex((l) => l.startsWith('date:'))
    lines.splice(dateIndex >= 0 ? dateIndex + 1 : lines.length, 0, line)
  }

  return source.replace(frontmatter, lines.join('\n'))
}

fs.mkdirSync(COVERS_DIR, { recursive: true })

let generated = 0

for (const locale of LOCALES) {
  const dir = path.join(BLOG_DIR, locale)
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

  for (const name of files) {
    const key = path.basename(name, '.md')
    if (onlyKey && key !== onlyKey) continue

    const file = path.join(dir, name)
    const post = readPost(file)
    const coverName = `${key}-${locale}.png`
    const url = `${COVERS_URL}/${coverName}`
    const current = post.data.cover

    if (current && current !== url && !force) {
      console.log(`Mantida (feita a mao): ${locale}/${key} -> ${current}`)
      continue
    }

    await renderCover(post.data.title, path.join(COVERS_DIR, coverName))
    if (current !== url) fs.writeFileSync(file, setCover(post, url))

    console.log(`Capa gerada: ${locale}/${key} -> ${url}`)
    generated += 1
  }
}

if (onlyKey && generated === 0) {
  console.log(`Nenhuma capa gerada para "${onlyKey}".`)
}
