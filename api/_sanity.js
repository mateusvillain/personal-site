import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

// Sem projectId o createClient lança na importação e a function morre com
// FUNCTION_INVOCATION_FAILED (sem JSON). Falha explícita aqui é mais fácil
// de diagnosticar num `vercel dev` sem `vercel env pull`.
if (!process.env.SANITY_API_PROJECT_ID) {
  throw new Error('SANITY_API_PROJECT_ID não configurada (rode `vercel env pull`)')
}

export const sanity = createClient({
  projectId: process.env.SANITY_API_PROJECT_ID,
  dataset: process.env.SANITY_API_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_READ_TOKEN,
  useCdn: false // token de leitura exige API "live", CDN não aceita auth
})

const builder = imageUrlBuilder(sanity)

export function imageUrl(source) {
  if (!source?.asset) return null
  return builder.image(source).width(1600).fit('max').auto('format').url()
}

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderChild(child, markDefs = []) {
  let text = escapeHtml(child.text || '')

  for (const mark of child.marks || []) {
    const markDef = markDefs.find((m) => m._key === mark)

    if (markDef?._type === 'link') {
      // Link sem href (annotation criada e não preenchida) vira texto puro.
      if (markDef.href) {
        text = `<a href="${escapeHtml(markDef.href)}" target="_blank" rel="noopener noreferrer">${text}</a>`
      }
      continue
    }

    switch (mark) {
      case 'strong':
        text = `<strong>${text}</strong>`
        break
      case 'em':
        text = `<em>${text}</em>`
        break
      case 'underline':
        text = `<u>${text}</u>`
        break
      case 'strike-through':
        text = `<s>${text}</s>`
        break
      case 'code':
        text = `<code>${text}</code>`
        break
    }
  }

  return text
}

function renderBlockHtml(block) {
  return (block.children || [])
    .map((child) => renderChild(child, block.markDefs))
    .join('')
}

/**
 * Portable Text (por idioma) -> mesmo shape de "sections" que
 * public/js/project-protected.js já sabe renderizar (era o formato
 * usado pelos blocks do Notion).
 */
export function blocksToSections(blocks = []) {
  const sections = []

  for (const block of blocks) {
    switch (block._type) {
      case 'block': {
        const html = renderBlockHtml(block)

        if (block.listItem) {
          sections.push({
            type: 'list-item',
            listType: block.listItem === 'bullet' ? 'ul' : 'ol',
            html
          })
        } else if (block.style === 'blockquote') {
          sections.push({ type: 'quote', html })
        } else if (block.style === 'h1' || block.style === 'h2' || block.style === 'h3') {
          sections.push({ type: 'heading', level: Number(block.style.slice(1)), html })
        } else {
          sections.push({ type: 'text', html })
        }
        break
      }

      case 'image':
        sections.push({
          type: 'image',
          src: imageUrl(block),
          alt: block.alt || ''
        })
        break

      case 'codeBlock':
        sections.push({
          type: 'code',
          html: block.code || '',
          language: block.language || 'css'
        })
        break
    }
  }

  return sections
}
