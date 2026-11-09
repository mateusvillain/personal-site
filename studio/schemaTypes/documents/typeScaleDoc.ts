import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Escala tipografica reutilizavel, renderizada no site como um visual
 * interativo (public/js/widgets/type-scale.js): o especime de cada estilo
 * ao lado de uma mini-pagina montada com eles. Os valores nao mudam entre
 * idiomas; so a descricao e o texto de exemplo sao traduzidos.
 *
 * `role` diz em que parte da mini-pagina o estilo aparece.
 */
export const TYPE_ROLES = [
  { title: 'Título da página', value: 'title' },
  { title: 'Subtítulo', value: 'subtitle' },
  { title: 'Título de seção (headline)', value: 'headline' },
  { title: 'Sobretítulo (agrupa informações)', value: 'overtitle' },
  { title: 'Corpo', value: 'body' },
  { title: 'Legenda', value: 'caption' },
  { title: 'Nenhuma', value: 'none' },
]

export default defineType({
  name: 'typeScaleDoc',
  title: 'Escala tipográfica',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome interno',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Descrição (PT/EN)',
      type: 'localeString',
      description: 'Lida por leitores de tela no lugar do visual.',
    }),
    defineField({
      name: 'sample',
      title: 'Texto de exemplo (PT/EN)',
      type: 'localeString',
      description: 'Ex.: The quick brown fox jumps over the lazy dog',
    }),
    defineField({
      name: 'styles',
      title: 'Estilos',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'typeStyle',
          fields: [
            defineField({
              name: 'name',
              title: 'Nome do estilo',
              type: 'string',
              description: 'Ex.: inter / bold / title',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'role',
              title: 'Onde aparece na mini-página',
              type: 'string',
              initialValue: 'none',
              options: { list: TYPE_ROLES },
            }),
            defineField({
              name: 'tag',
              title: 'Tag HTML',
              type: 'string',
              initialValue: 'p',
              options: { list: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span'] },
            }),
            defineField({
              name: 'family',
              title: 'Fonte',
              type: 'string',
              initialValue: 'Inter',
            }),
            defineField({
              name: 'weight',
              title: 'Peso',
              type: 'number',
              initialValue: 400,
              options: { list: [300, 400, 500, 600, 700, 800] },
            }),
            defineField({
              name: 'fontSize',
              title: 'font-size (rem) — fixo, ou o máximo do clamp',
              type: 'number',
              validation: (Rule) => Rule.required().min(0.25).max(10),
            }),
            // clamp(fluidMin, calc(fluidVw vw + fluidRem rem), fontSize)
            defineField({
              name: 'fluid',
              title: 'Fluido (clamp)',
              type: 'object',
              description:
                'Deixe vazio se o tamanho for fixo. clamp(mínimo, calc(Xvw + Yrem), font-size).',
              options: { collapsible: true, collapsed: true },
              fields: [
                defineField({ name: 'min', title: 'Mínimo (rem)', type: 'number' }),
                defineField({ name: 'vw', title: 'Coeficiente (vw)', type: 'number' }),
                defineField({ name: 'rem', title: 'Constante (rem)', type: 'number' }),
              ],
            }),
            defineField({
              name: 'lineHeight',
              title: 'line-height',
              type: 'number',
              validation: (Rule) => Rule.required().min(0.8).max(3),
            }),
            defineField({
              name: 'uppercase',
              title: 'Caixa alta',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: 'name', size: 'fontSize', tag: 'tag', min: 'fluid.min' },
            prepare: ({ title, size, tag, min }) => ({
              title,
              subtitle: `${tag || 'p'} · ${min ? `${min}–` : ''}${size ?? '?'}rem`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'caption.pt' },
  },
})
