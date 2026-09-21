import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemaTypes'

// projectId/dataset são públicos (ver sanity.cli.ts) — mesmo projeto
// provisionado pela integração Vercel (SANITY_API_PROJECT_ID no site).
export default defineConfig({
  name: 'personal-site-studio',
  title: 'Mateus Villain — Cases (privado)',

  projectId: 'qdrvdscy',
  dataset: 'production',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
