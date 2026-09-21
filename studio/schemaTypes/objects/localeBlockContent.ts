import { defineField, defineType } from 'sanity'

// Rich text por idioma. Cada array aceita:
// - texto (parágrafo, headings 1-3, citação, listas) via block padrão
// - imagem com alt obrigatório
// - bloco de código (codeBlock)
// Mapeia 1:1 para o "sections" que api/project.js já entrega ao client
// (public/js/project-protected.js), então o front não precisa mudar.
const blockContentArray = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Título 1', value: 'h1' },
        { title: 'Título 2', value: 'h2' },
        { title: 'Título 3', value: 'h3' },
        { title: 'Citação', value: 'blockquote' },
      ],
      lists: [
        { title: 'Lista com marcadores', value: 'bullet' },
        { title: 'Lista numerada', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Negrito', value: 'strong' },
          { title: 'Itálico', value: 'em' },
          { title: 'Sublinhado', value: 'underline' },
          { title: 'Riscado', value: 'strike-through' },
          { title: 'Código', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [{ name: 'href', type: 'url', title: 'URL' }],
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Texto alternativo',
          validation: (Rule: any) => Rule.required(),
        },
      ],
    },
    { type: 'codeBlock' },
  ],
}

export default defineType({
  name: 'localeBlockContent',
  title: 'Conteúdo (PT/EN)',
  type: 'object',
  fields: [
    defineField({ name: 'pt', title: 'Português', ...blockContentArray }),
    defineField({ name: 'en', title: 'English', ...blockContentArray }),
  ],
})
