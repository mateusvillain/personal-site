import { defineField, defineType } from 'sanity'

// Bloco do conteudo que mostra um "Mapa de tokens" (documento). O mesmo
// mapa pode ser inserido no PT e no EN sem reescrever os tokens.
export default defineType({
  name: 'tokenMapRef',
  title: 'Mapa de tokens (interativo)',
  type: 'object',
  fields: [
    defineField({
      name: 'map',
      title: 'Mapa',
      type: 'reference',
      to: [{ type: 'tokenMapDoc' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'map.name', subtitle: 'map.caption.pt' },
    prepare: ({ title, subtitle }) => ({
      title: `Mapa de tokens: ${title || '(escolha um mapa)'}`,
      subtitle,
    }),
  },
})
