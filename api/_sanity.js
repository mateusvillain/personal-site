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

// A linguagem vira classe CSS no navegador: so letras, numeros e hifen
function codeLanguage(value) {
  return /^[a-z0-9-]{1,20}$/.test(value || '') ? value : 'css'
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

const HEX = /^#[0-9a-f]{6}$/i

// So o que o visual precisa, com a cor validada (vai para um style no client)
function tokenMapData(block) {
  return {
    caption: block.caption || '',
    groups: (block.groups || []).map((group) => ({
      name: group.name || '',
      tokens: (group.tokens || [])
        .filter((t) => t?.name && HEX.test(t.hex || ''))
        .map((t) => ({
          name: t.name,
          primitive: t.primitive || '',
          hex: t.hex.toLowerCase(),
          role: t.role || 'none'
        }))
    }))
  }
}

const TYPE_ROLES = ['title', 'subtitle', 'headline', 'overtitle', 'body', 'caption', 'none']
const TYPE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span']
const FAMILY = /^[\w -]{1,40}$/

const inRange = (n, min, max) => typeof n === 'number' && n >= min && n <= max

// clamp(min, calc(vw + rem), max): so vale com os tres numeros e min < max
function fluidData(f, max) {
  if (!f || !inRange(f.min, 0.25, 10) || !inRange(f.vw, 0, 20) || !inRange(f.rem, -10, 10)) {
    return null
  }
  return f.min < max ? { min: f.min, vw: f.vw, rem: f.rem } : null
}

// Estilos validados: os valores viram style inline no client
function typeScaleData(scale, locale) {
  return {
    caption: scale.caption?.[locale] || scale.caption?.pt || '',
    sample: scale.sample?.[locale] || scale.sample?.pt || '',
    styles: (scale.styles || [])
      .filter((s) => s?.name && inRange(s.fontSize, 0.25, 10) && inRange(s.lineHeight, 0.8, 3))
      .map((s) => ({
        name: s.name,
        role: TYPE_ROLES.includes(s.role) ? s.role : 'none',
        tag: TYPE_TAGS.includes(s.tag) ? s.tag : 'p',
        family: FAMILY.test(s.family || '') ? s.family : 'Inter',
        weight: inRange(s.weight, 100, 900) ? Math.round(s.weight) : 400,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        uppercase: Boolean(s.uppercase),
        fluid: fluidData(s.fluid, s.fontSize)
      }))
  }
}

/**
 * Portable Text (por idioma) -> mesmo shape de "sections" que
 * public/js/project-protected.js já sabe renderizar (era o formato
 * usado pelos blocks do Notion).
 */
export function blocksToSections(blocks = [], locale = 'pt') {
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

      // formato antigo: mapa escrito direto no conteudo do idioma
      case 'tokenMap':
        sections.push({ type: 'token-map', data: tokenMapData(block) })
        break

      // mapa compartilhado entre idiomas (documento tokenMapDoc)
      case 'tokenMapRef':
        if (block.map) {
          const caption = block.map.caption?.[locale] || block.map.caption?.pt || ''
          sections.push({ type: 'token-map', data: tokenMapData({ ...block.map, caption }) })
        }
        break

      case 'typeScaleRef':
        if (block.scale) {
          sections.push({ type: 'type-scale', data: typeScaleData(block.scale, locale) })
        }
        break

      case 'codeBlock': {
        // Com abas, cada aba vira um { label, language, html }; sem abas, o
        // bloco segue o formato antigo (uma aba so, sem rotulo).
        const tabs = (Array.isArray(block.tabs) ? block.tabs : [])
          .filter((tab) => tab && typeof tab.code === 'string' && tab.code.trim())
          .map((tab) => ({
            label: String(tab.label || '').slice(0, 40),
            language: codeLanguage(tab.language),
            html: tab.code
          }))

        if (tabs.length) {
          sections.push({ type: 'code', tabs })
        } else {
          sections.push({
            type: 'code',
            html: block.code || '',
            language: codeLanguage(block.language),
            title: String(block.title || '').slice(0, 60)
          })
        }
        break
      }
    }
  }

  return sections
}
