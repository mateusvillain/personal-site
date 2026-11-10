import { defineField, defineType } from 'sanity'
import { createCopyPasteInput } from '../components/CopyPasteInput'

// Bloco do conteudo que mostra uma "Escala tipográfica" (documento), o
// mesmo em PT e EN.
export default defineType({
  name: 'typeScaleRef',
  title: 'Escala tipográfica (interativa)',
  type: 'object',
  components: {
    input: createCopyPasteInput({
      type: 'typeScaleRef',
      label: 'bloco de escala tipográfica',
      fields: ['scale'],
    }),
  },
  fields: [
    defineField({
      name: 'scale',
      title: 'Escala',
      type: 'reference',
      to: [{ type: 'typeScaleDoc' }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'scale.name', subtitle: 'scale.caption.pt' },
    prepare: ({ title, subtitle }) => ({
      title: `Escala tipográfica: ${title || '(escolha uma escala)'}`,
      subtitle,
    }),
  },
})
