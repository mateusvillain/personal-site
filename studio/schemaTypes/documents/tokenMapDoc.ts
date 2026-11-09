import { defineField, defineType } from 'sanity'
import { tokenGroupsField } from '../objects/tokenMap'

/**
 * Mapa de tokens reutilizavel. Nomes de token e cores nao mudam entre
 * idiomas, entao ficam aqui uma vez so; o conteudo PT e EN do case so
 * aponta para este documento (bloco tokenMapRef). Apenas a descricao e
 * traduzida.
 */
export default defineType({
  name: 'tokenMapDoc',
  title: 'Mapa de tokens',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nome interno',
      type: 'string',
      description: 'Só para achar o mapa no Studio (ex.: Cores semânticas).',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Descrição (PT/EN)',
      type: 'localeString',
      description: 'Lida por leitores de tela no lugar do visual.',
    }),
    tokenGroupsField,
  ],
  preview: {
    select: { title: 'name', subtitle: 'caption.pt' },
  },
})
