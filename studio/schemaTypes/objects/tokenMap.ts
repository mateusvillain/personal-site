import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Mapa de tokens semanticos -> primitivos, renderizado no site como um
 * visual interativo (public/js/widgets/token-map.js): a lista de tokens ao
 * lado de uma mini-interface pintada com as proprias cores.
 *
 * Os dados ficam aqui (atras da senha); o codigo do site so desenha.
 * `role` diz qual parte da mini-interface o token pinta.
 */
export const TOKEN_ROLES = [
  { title: 'Fundo · página', value: 'bg-page' },
  { title: 'Fundo · base (card)', value: 'bg-base' },
  { title: 'Fundo · overlay', value: 'bg-overlay' },
  { title: 'Fundo · primário (botão)', value: 'bg-primary' },
  { title: 'Fundo · perigo (alerta)', value: 'bg-danger' },
  { title: 'Texto · título', value: 'text-heading' },
  { title: 'Texto · corpo', value: 'text-body' },
  { title: 'Texto · inverso', value: 'text-inverse' },
  { title: 'Texto · primário (link)', value: 'text-primary' },
  { title: 'Borda · traçado (campo)', value: 'border-stroke' },
  { title: 'Borda · divisória', value: 'border-divisor' },
  { title: 'Borda · perigo', value: 'border-danger' },
  { title: 'Borda · info', value: 'border-info' },
  { title: 'Borda · sucesso', value: 'border-success' },
  { title: 'Borda · aviso', value: 'border-warning' },
  { title: 'Nenhuma', value: 'none' },
]

// Grupos -> tokens. Compartilhado entre o bloco antigo (tokenMap) e o
// documento reutilizavel (tokenMapDoc).
export const tokenGroupsField = defineField({
  name: 'groups',
  title: 'Grupos',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'object',
      name: 'tokenGroup',
      fields: [
        defineField({ name: 'name', title: 'Nome', type: 'string' }),
        defineField({
          name: 'tokens',
          title: 'Tokens',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'tokenRow',
              fields: [
                defineField({
                  name: 'name',
                  title: 'Token semântico',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'primitive',
                  title: 'Token primitivo',
                  type: 'string',
                  validation: (Rule) => Rule.required(),
                }),
                defineField({
                  name: 'hex',
                  title: 'Cor (hex)',
                  type: 'string',
                  validation: (Rule) =>
                    Rule.required().regex(/^#[0-9a-fA-F]{6}$/, {
                      name: 'hex #RRGGBB',
                    }),
                }),
                defineField({
                  name: 'role',
                  title: 'Onde aparece na mini-interface',
                  type: 'string',
                  initialValue: 'none',
                  options: { list: TOKEN_ROLES },
                }),
              ],
              preview: {
                select: { title: 'name', subtitle: 'primitive' },
              },
            }),
          ],
        }),
      ],
      preview: {
        select: { title: 'name', tokens: 'tokens' },
        prepare: ({ title, tokens }) => ({
          title,
          subtitle: `${tokens?.length ?? 0} tokens`,
        }),
      },
    }),
  ],
})

/**
 * ANTIGO: mapa escrito direto no conteudo de um idioma. Mantido para os
 * blocos ja salvos continuarem validos; para novos, use o documento
 * "Mapa de tokens" (tokenMapDoc) via bloco tokenMapRef.
 */
export default defineType({
  name: 'tokenMap',
  title: 'Mapa de tokens (antigo, só neste idioma)',
  type: 'object',
  fields: [
    defineField({
      name: 'caption',
      title: 'Descrição',
      type: 'string',
      description: 'Lida por leitores de tela no lugar do visual.',
      validation: (Rule) => Rule.required(),
    }),
    tokenGroupsField,
  ],
  preview: {
    select: { caption: 'caption' },
    prepare: ({ caption }) => ({
      title: 'Mapa de tokens (antigo)',
      subtitle: caption,
    }),
  },
})
