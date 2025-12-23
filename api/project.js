import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY
});

export default async function handler(req, res) {
  try {
    /* --------------------------------------------------
     * 1. Método
     * -------------------------------------------------- */
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        error: "Method not allowed"
      });
    }

    /* --------------------------------------------------
     * 2. Body seguro
     * -------------------------------------------------- */
    const { project, password } = req.body || {};

    if (!project || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing project or password"
      });
    }

    /* --------------------------------------------------
     * 3. Senhas por slug
     * -------------------------------------------------- */
    const PASSWORDS = {
      "project-locaweb-ds": process.env.PASSWORD_LOCAWEB_DS
    };

    if (!PASSWORDS[project]) {
      return res.status(404).json({
        success: false,
        error: "Project not configured"
      });
    }

    if (PASSWORDS[project] !== password) {
      return res.status(401).json({
        success: false,
        error: "Invalid password"
      });
    }

    /* --------------------------------------------------
     * 4. Busca do projeto no Notion
     * Usa o Title (Name) como slug
     * -------------------------------------------------- */
    const query = await notion.databases.query({
      database_id: process.env.NOTION_PROJECTS_DB_ID,
      filter: {
        property: "Name",
        title: {
          equals: project
        }
      }
    });

    if (!query.results || query.results.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Project not found in Notion"
      });
    }

    const pageId = query.results[0].id;

    /* --------------------------------------------------
     * 5. Busca dos blocos da página
     * -------------------------------------------------- */
    const blocksResponse = await notion.blocks.children.list({
      block_id: pageId
    });

    return res.status(200).json({
      success: true,
      blocks: blocksResponse.results
    });

  } catch (error) {
    /* --------------------------------------------------
     * 6. Erro explícito (debug real)
     * -------------------------------------------------- */
    console.error("❌ PROJECT CONTENT API ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
