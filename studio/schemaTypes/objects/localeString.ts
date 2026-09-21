import { defineField, defineType } from 'sanity'

// Campo curto (título, alt de imagem etc.) com valor por idioma.
// Substitui a limitação do Notion, que só tinha uma página por slug
// e não separava conteúdo por idioma.
export default defineType({
  name: 'localeString',
  title: 'Texto (PT/EN)',
  type: 'object',
  fields: [
    defineField({ name: 'pt', title: 'Português', type: 'string' }),
    defineField({ name: 'en', title: 'English', type: 'string' }),
  ],
  preview: {
    select: { title: 'pt' },
  },
})
