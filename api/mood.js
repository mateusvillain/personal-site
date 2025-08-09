export default async function handler(req, res) {
  const notionToken = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        filter: {
          property: 'Status',
          select: { equals: 'Hoje' }
        }
      })
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(200).json({ mood: '🤔 Have you drunk water today?' });
    }

    const page = data.results[0];

    const emoji = page.properties.Emoji?.rich_text?.[0]?.plain_text || '🤔';
    const mensagem = page.properties.Mensagem?.rich_text?.[0]?.plain_text || '';

    res.status(200).json({
      mood: `${emoji}`,
      mensagem
    });
  } catch (err) {
    res.status(500).json({ erro: '🤔' });
  }
}
