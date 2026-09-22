/**
 * Migra o conteúdo protegido de um case do Notion para o Sanity
 * (Portable Text em `content.pt`, imagens enviadas como assets).
 *
 * Uso:
 *   node --env-file=.env.local scripts/migrate-notion-to-sanity.mjs <slug-notion> <slug-sanity> [--write]
 *
 * Sem --write só imprime o resumo do que seria gravado. Com --write
 * SOBRESCREVE `content.pt` e remove `content.en` (a API cai no PT
 * quando o EN está vazio, então a página em inglês continua funcionando
 * até a tradução ser feita no Studio).
 */
import { randomBytes } from 'node:crypto'
import { createClient } from '@sanity/client'

const [notionSlug, sanitySlug, ...flags] = process.argv.slice(2)
const WRITE = flags.includes('--write')

if (!notionSlug || !sanitySlug) {
  console.error('uso: migrate-notion-to-sanity.mjs <slug-notion> <slug-sanity> [--write]')
  process.exit(1)
}

const {
  NOTION_PROJECT_API,
  NOTION_PROJECT_DB,
  SANITY_API_PROJECT_ID,
  SANITY_API_DATASET = 'production',
  SANITY_API_WRITE_TOKEN,
} = process.env

for (const [k, v] of Object.entries({ NOTION_PROJECT_API, NOTION_PROJECT_DB, SANITY_API_PROJECT_ID, SANITY_API_WRITE_TOKEN })) {
  if (!v) {
    console.error(`${k} ausente — rode com --env-file=.env.local`)
    process.exit(1)
  }
}

const sanity = createClient({
  projectId: SANITY_API_PROJECT_ID,
  dataset: SANITY_API_DATASET,
  apiVersion: '2024-01-01',
  token: SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const notionHeaders = {
  Authorization: `Bearer ${NOTION_PROJECT_API}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
}

const key = () => randomBytes(6).toString('hex')

/* =====================================================
   Notion
====================================================== */
async function notion(path, init) {
  const res = await fetch(`https://api.notion.com/v1${path}`, { headers: notionHeaders, ...init })
  const data = await res.json()
  if (!res.ok) throw new Error(`Notion ${path}: ${data.message}`)
  return data
}

async function findPage(slug) {
  const data = await notion(`/databases/${NOTION_PROJECT_DB}/query`, {
    method: 'POST',
    body: JSON.stringify({ filter: { property: 'slug', rich_text: { equals: slug } } }),
  })
  return data.results[0]
}

async function children(blockId) {
  const out = []
  let cursor
  do {
    const data = await notion(`/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`)
    out.push(...data.results)
    cursor = data.has_more ? data.next_cursor : null
  } while (cursor)
  return out
}

/* =====================================================
   rich_text -> spans + markDefs
====================================================== */
const DECORATORS = [
  ['bold', 'strong'],
  ['italic', 'em'],
  ['underline', 'underline'],
  ['strikethrough', 'strike-through'],
  ['code', 'code'],
]

function richTextToSpans(richText = []) {
  const markDefs = []
  const spans = []

  for (const item of richText) {
    const text = item.plain_text || ''
    if (!text) continue

    const marks = DECORATORS.filter(([n]) => item.annotations?.[n]).map(([, m]) => m)

    if (item.href) {
      const _key = key()
      markDefs.push({ _key, _type: 'link', href: item.href })
      marks.push(_key)
    }

    spans.push({ _key: key(), _type: 'span', text, marks })
  }

  return { spans, markDefs }
}

function textBlock(richText, { style = 'normal', listItem, level } = {}) {
  const { spans, markDefs } = richTextToSpans(richText)
  if (!spans.length) return null
  const block = { _key: key(), _type: 'block', style, markDefs, children: spans }
  if (listItem) {
    block.listItem = listItem
    block.level = level
  }
  return block
}

const CODE_LANGUAGES = ['css', 'html', 'javascript', 'typescript', 'json', 'bash', 'markdown']
const CODE_ALIASES = { shell: 'bash', sh: 'bash', zsh: 'bash', js: 'javascript', ts: 'typescript', scss: 'css', md: 'markdown' }

function codeLanguage(lang = '') {
  const l = CODE_ALIASES[lang] || lang
  return CODE_LANGUAGES.includes(l) ? l : 'css'
}

/* =====================================================
   Imagens: baixa do Notion (URL expira) e sobe como asset
====================================================== */
async function uploadImage(block) {
  const url = block.image.file?.url || block.image.external?.url
  if (!url) return null

  const alt = (block.image.caption || []).map((t) => t.plain_text).join('').trim()
  const filename = new URL(url).pathname.split('/').pop() || 'image'

  if (!WRITE) {
    return { _key: key(), _type: 'image', alt: alt || 'Imagem do case', asset: { _ref: `dry-run:${filename}` } }
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`download falhou: ${url}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  const asset = await sanity.assets.upload('image', buffer, { filename })

  return {
    _key: key(),
    _type: 'image',
    // alt é obrigatório no schema; caption vazia no Notion vira um fallback
    // genérico pra revisar no Studio
    alt: alt || 'Imagem do case',
    asset: { _type: 'reference', _ref: asset._id },
  }
}

/* =====================================================
   Notion blocks -> Portable Text
====================================================== */
async function convert(blocks, level = 1) {
  const out = []

  for (const block of blocks) {
    const data = block[block.type]

    switch (block.type) {
      case 'heading_1':
      case 'heading_2':
      case 'heading_3':
        out.push(textBlock(data.rich_text, { style: `h${block.type.slice(-1)}` }))
        break

      case 'paragraph':
        out.push(textBlock(data.rich_text))
        break

      case 'quote':
        out.push(textBlock(data.rich_text, { style: 'blockquote' }))
        break

      case 'bulleted_list_item':
      case 'numbered_list_item':
        out.push(
          textBlock(data.rich_text, {
            listItem: block.type === 'bulleted_list_item' ? 'bullet' : 'number',
            level,
          }),
        )
        break

      case 'code':
        out.push({
          _key: key(),
          _type: 'codeBlock',
          language: codeLanguage(data.language),
          code: (data.rich_text || []).map((t) => t.plain_text).join(''),
        })
        break

      case 'image':
        out.push(await uploadImage(block))
        break

      case 'divider':
        // Não existe no schema; o Notion usava só como respiro visual.
        break

      default:
        console.warn(`bloco ignorado: ${block.type}`)
    }

    // Sub-itens (listas aninhadas) viram itens de nível seguinte.
    if (block.has_children && block.type !== 'code') {
      out.push(...(await convert(await children(block.id), level + 1)))
    }
  }

  return out.filter(Boolean)
}

/* =====================================================
   main
====================================================== */
const page = await findPage(notionSlug)
if (!page) {
  console.error(`página "${notionSlug}" não encontrada no Notion`)
  process.exit(1)
}

const doc = await sanity.fetch(`*[_type == "caseStudy" && slug.current == $slug && !(_id in path("drafts.**"))][0]{ _id, "pt": count(content.pt), "en": count(content.en) }`, {
  slug: sanitySlug,
})
if (!doc) {
  console.error(`documento "${sanitySlug}" não encontrado no Sanity`)
  process.exit(1)
}

const notionBlocks = await children(page.id)
const pt = await convert(notionBlocks)

const summary = pt.reduce((acc, b) => {
  const k = b._type === 'block' ? (b.listItem ? `list:${b.listItem}` : b.style) : b._type
  acc[k] = (acc[k] || 0) + 1
  return acc
}, {})

console.log(`Notion: ${notionBlocks.length} blocos -> Portable Text: ${pt.length}`)
console.log(summary)
console.log(`Sanity ${doc._id}: content.pt ${doc.pt ?? 0} -> ${pt.length}, content.en ${doc.en ?? 0} -> (removido)`)

if (!WRITE) {
  console.log('\ndry-run — rode com --write para gravar')
  process.exit(0)
}

await sanity.patch(doc._id).set({ 'content.pt': pt }).unset(['content.en']).commit()
console.log('gravado')
