function renderRichText(richText = []) {
  return richText
    .map(item => {
      let text = item.plain_text || ''

      if (item.annotations?.code) {
        text = `<code>${text}</code>`
      }

      if (item.annotations?.bold) {
        text = `<strong>${text}</strong>`
      }

      if (item.annotations?.italic) {
        text = `<em>${text}</em>`
      }

      if (item.annotations?.underline) {
        text = `<u>${text}</u>`
      }

      if (item.annotations?.strikethrough) {
        text = `<s>${text}</s>`
      }

      if (item.href) {
        text = `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      }

      return text
    })
    .join('')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { slug, password } = req.body || {}

  if (!slug) {
    return res.status(400).json({ error: 'Slug não informado' })
  }

  const NOTION_TOKEN = process.env.NOTION_PROJECT_API
  const DATABASE_ID = process.env.NOTION_PROJECT_DB

  try {
    /* =====================================================
       1. Buscar projeto pelo slug
    ====================================================== */
    const queryResponse = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            property: 'slug',
            rich_text: { equals: slug }
          }
        })
      }
    )

    const queryData = await queryResponse.json()
    const page = queryData.results[0]

    if (!page || !page.properties.public?.checkbox) {
      return res.status(404).json({ error: 'Projeto não encontrado' })
    }

    const props = page.properties

    /* =====================================================
       2. Verificar senha (por projeto)
    ====================================================== */
    if (props.requires_password?.checkbox) {
      const passwordKey =
        props.password_key?.rich_text?.[0]?.plain_text

      const expectedPassword =
        process.env[`PASSWORD_${passwordKey}`]

      if (!password || password !== expectedPassword) {
        return res.status(401).json({ error: 'Senha inválida' })
      }
    }

    /* =====================================================
       3. Buscar blocks da página
    ====================================================== */
    const blocksResponse = await fetch(
      `https://api.notion.com/v1/blocks/${page.id}/children`,
      {
        headers: {
          Authorization: `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28'
        }
      }
    )

    const blocksData = await blocksResponse.json()

    /* =====================================================
       4. Converter blocks → sections (HTML)
    ====================================================== */
    const sections = []

    for (const block of blocksData.results) {
      switch (block.type) {
        case 'heading_1':
        case 'heading_2':
        case 'heading_3': {
          const level = Number(block.type.split('_')[1])
          sections.push({
            type: 'heading',
            level,
            html: renderRichText(block[block.type].rich_text)
          })
          break
        }

        case 'image':
          sections.push({
            type: 'image',
            src:
              block.image.file?.url ||
              block.image.external?.url ||
              null,
            alt: renderRichText(block.image.caption) || ''
          })
          break

        case 'paragraph':
          sections.push({
            type: 'text',
            html: renderRichText(block.paragraph.rich_text)
          })
          break

        case 'bulleted_list_item':
          sections.push({
            type: 'list-item',
            listType: 'ul',
            html: renderRichText(block.bulleted_list_item.rich_text)
          })
          break

        case 'numbered_list_item':
          sections.push({
            type: 'list-item',
            listType: 'ol',
            html: renderRichText(block.numbered_list_item.rich_text)
          })
          break

        case 'quote':
          sections.push({
            type: 'quote',
            html: renderRichText(block.quote.rich_text)
          })
          break

        // case 'code':
        //   sections.push({
        //     type: 'code',
        //     language: block.code.language,
        //     html: block.code.rich_text[0]?.plain_text || ''
        //   })
        //   break

        case 'code': {
          const text = block.code?.rich_text
            ?.map(t => t.plain_text)
            .join('') || ''

          sections.push({
            type: 'code',
            html: text,
            language: block.code?.language || 'css'
          })
          break
        }

        case 'divider':
          sections.push({ type: 'divider' })
          break
      }
    }

    return res.status(200).json({
      title: props.Name?.title?.[0]?.plain_text || '',
      sections
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
