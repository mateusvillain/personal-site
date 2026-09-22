import { defineField, defineType } from 'sanity'

// Bloco de código dentro do rich text — equivalente ao block "code" do Notion.
export default defineType({
  name: 'codeBlock',
  title: 'Bloco de código',
  type: 'object',
  fields: [
    defineField({
      name: 'language',
      title: 'Linguagem',
      type: 'string',
      initialValue: 'css',
      options: {
        list: ['css', 'html', 'javascript', 'typescript', 'json', 'bash', 'markdown'],
      },
    }),
    defineField({
      name: 'code',
      title: 'Código',
      type: 'text',
      rows: 10,
    }),
  ],
  preview: {
    select: { language: 'language', code: 'code' },
    prepare({ language, code }) {
      return {
        title: `Código (${language || 'css'})`,
        subtitle: (code || '').slice(0, 60),
      }
    },
  },
})
