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
      name: 'rootFontSize',
      title: 'font-size base (px)',
      description:
        'Quanto vale 1rem nesse design system (o font-size do <html>). Todos os valores em rem da escala são convertidos para px com ele.',
      type: 'number',
      initialValue: 16,
      validation: (Rule) => Rule.required().min(8).max(32),
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
                'Deixe vazio se o tamanho for fixo (ex.: 1rem): vale só o font-size. clamp(mínimo, calc(Xvw + Yrem), font-size).',
              options: { collapsible: true, collapsed: true },
              // os mesmos limites da API (api/_sanity.js, fluidData): fora
              // deles o site descarta o clamp e mostra o estilo como fixo
              fields: [
                defineField({
                  name: 'min',
                  title: 'Mínimo (rem)',
                  type: 'number',
                  validation: (Rule) =>
                    Rule.min(0.25)
                      .max(10)
                      .custom((min, ctx) => {
                        // sem coeficiente vw nao ha clamp: o estilo e fixo e o
                        // minimo nao importa
                        if (typeof (ctx.parent as { vw?: number } | undefined)?.vw !== 'number') return true
                        // caminho: styles[_key == ...].fluid.min -> acha o estilo pela _key
                        const seg = ctx.path?.[1] as { _key?: string } | undefined
                        const styles = ctx.document?.styles as { _key?: string; fontSize?: number }[] | undefined
                        const max = styles?.find((st) => st._key === seg?._key)?.fontSize
                        return typeof min === 'number' && typeof max === 'number' && min >= max
                          ? 'O mínimo precisa ser menor que o font-size; sem isso o estilo fica fixo.'
                          : true
                      }),
                }),
                defineField({
                  name: 'vw',
                  title: 'Coeficiente (vw)',
                  description: 'Com ponto decimal, ex.: 1.19875 (não 119875).',
                  type: 'number',
                  validation: (Rule) =>
                    Rule.min(0).max(20).error('Entre 0 e 20. Confira o ponto decimal, ex.: 1.19875.'),
                }),
                defineField({
                  name: 'rem',
                  title: 'Constante (rem)',
                  description:
                    'O termo somado ao vw dentro do calc(), ex.: 1.753 — não é o máximo (esse é o font-size).',
                  type: 'number',
                  validation: (Rule) =>
                    Rule.min(-10)
                      .max(10)
                      .custom((rem, ctx) => {
                        const seg = ctx.path?.[1] as { _key?: string } | undefined
                        const styles = ctx.document?.styles as { _key?: string; fontSize?: number }[] | undefined
                        const max = styles?.find((st) => st._key === seg?._key)?.fontSize
                        return typeof rem === 'number' && typeof max === 'number' && rem >= max
                          ? 'Com a constante igual ou maior que o font-size, o calc() já começa acima do máximo e a escala fica travada nele.'
                          : true
                      }),
                }),
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
