import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { project, password } = req.body;

  if (!project || !password) {
    return res.status(400).json({ success: false });
  }

  // 🔐 Mapeamento de senhas por slug
  const PASSWORDS = {
    "project-locaweb-ds": process.env.PASSWORD_LOCAWEB_DS
  };

  if (PASSWORDS[project] !== password) {
    return res.status(401).json({ success: false });
  }

  try {
    // 🔎 Busca o projeto na database pelo slug
    const query = await notion.databases.query({
      database_id: process.env.NOTION_PROJECTS_DB_ID,
      filter: {
        property: "Slug",
        rich_text: {
          equals: project
        }
      }
    });

    if (!query.results.length) {
      return res.status(404).json({ success: false });
    }

    const pageId = query.results[0].id;

    // 📄 Busca o conteúdo da página (blocks)
    const blocks = await notion.blocks.children.list({
      block_id: pageId
    });

    return res.status(200).json({
      success: true,
      blocks: blocks.results
    });

  } catch (error) {
    console.error("PROJECT CONTENT API ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
