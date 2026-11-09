import { defineArrayMember, defineField, defineType } from 'sanity'

const LANGUAGES = ['css', 'scss', 'html', 'javascript', 'typescript', 'json', 'bash', 'markdown']

// Bloco de código dentro do rich text — equivalente ao block "code" do Notion.
// Sem abas: usa Título (opcional), Linguagem e Código.
// Com abas: cada aba tem rótulo, linguagem e código próprios, e os campos de
// cima ficam escondidos.
export default defineType({
  name: 'codeBlock',
  title: 'Bloco de código',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Título (opcional)',
      description: 'Aparece na barra da janela, ex.: tokens.css',
      type: 'string',
      hidden: ({ parent }) => Boolean(parent?.tabs?.length),
    }),
    defineField({
      name: 'language',
      title: 'Linguagem',
      type: 'string',
      initialValue: 'css',
      options: { list: LANGUAGES },
      hidden: ({ parent }) => Boolean(parent?.tabs?.length),
    }),
    defineField({
      name: 'code',
      title: 'Código',
      type: 'text',
      rows: 10,
      hidden: ({ parent }) => Boolean(parent?.tabs?.length),
    }),
    defineField({
      name: 'tabs',
      title: 'Abas (opcional)',
      description: 'Com abas, o bloco mostra um código por aba.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'codeTab',
          title: 'Aba',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Rótulo',
              description: 'Nome da aba, ex.: tokens.css ou Locaweb',
              type: 'string',
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: 'language',
              title: 'Linguagem',
              type: 'string',
              initialValue: 'css',
              options: { list: LANGUAGES },
            }),
            defineField({
              name: 'code',
              title: 'Código',
              type: 'text',
              rows: 10,
            }),
          ],
          preview: {
            select: { title: 'label', language: 'language' },
            prepare: ({ title, language }) => ({
              title: title || 'Aba',
              subtitle: language || 'css',
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { language: 'language', code: 'code', title: 'title', tabs: 'tabs' },
    prepare({ language, code, title, tabs }) {
      if (tabs?.length) {
        return {
          title: `Código em abas (${tabs.length})`,
          subtitle: tabs.map((tab: { label?: string }) => tab.label).join(' · '),
        }
      }
      return {
        title: title ? `Código: ${title}` : `Código (${language || 'css'})`,
        subtitle: (code || '').slice(0, 60),
      }
    },
  },
})
