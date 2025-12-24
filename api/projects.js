export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const NOTION_TOKEN = process.env.NOTION_PROJECT_API
  const DATABASE_ID = process.env.NOTION_PROJECT_DB

  if (!NOTION_TOKEN || !DATABASE_ID) {
    return res.status(500).json({ error: 'Variáveis de ambiente ausentes' })
  }

  try {
    const response = await fetch(
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
            property: 'public',
            checkbox: { equals: true }
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Notion error:', errorText)
      return res.status(500).json({ error: 'Erro ao consultar o Notion' })
    }

    const data = await response.json()

    const projects = data.results.map(page => {
      const props = page.properties

      return {
        title: props.Name?.title?.[0]?.plain_text || '',
        slug: props.slug?.rich_text?.[0]?.plain_text || '',
        requires_password: props.requires_password?.checkbox || false,
        cover_image:
          props.cover_image?.files?.[0]?.file?.url ||
          props.cover_image?.files?.[0]?.external?.url ||
          null
      }
    })

    return res.status(200).json(projects)
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
