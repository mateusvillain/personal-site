import { defineArrayMember, defineField, defineType } from 'sanity'
import { createCopyPasteInput } from '../components/CopyPasteInput'

const LANGUAGES = ['css', 'scss', 'html', 'javascript', 'typescript', 'json', 'bash', 'markdown']

const PREVIEW_HELP =
  'Opcional. Monta uma interface própria na prévia. O elemento com o atributo data-preview recebe as declarações do código (ex.: box-shadow); sem data-preview, o HTML/CSS aparece como está. Scripts e arquivos externos não carregam.'

// HTML e CSS da previa personalizada; usados no bloco e, como substituto,
// em cada aba
// `hidden` vale so no bloco (sem `preview` marcado); nas abas os campos
// ficam sempre visiveis
const previewFields = (hidden?: (ctx: { parent?: { preview?: boolean } }) => boolean) => [
  defineField({
    name: 'previewHtml',
    title: 'HTML da prévia',
    description: PREVIEW_HELP,
    type: 'text',
    rows: 6,
    fieldset: 'customPreview',
    hidden,
  }),
  defineField({
    name: 'previewCss',
    title: 'CSS da prévia',
    description: 'Estilos só da prévia; não afetam o resto da página.',
    type: 'text',
    rows: 6,
    fieldset: 'customPreview',
    hidden,
  }),
]

// Bloco de código dentro do rich text — equivalente ao block "code" do Notion.
// Sem abas: usa Título (opcional), Linguagem e Código.
// Com abas: cada aba tem rótulo, linguagem e código próprios, e os campos de
// cima ficam escondidos.
export default defineType({
  name: 'codeBlock',
  title: 'Bloco de código',
  type: 'object',
  components: {
    input: createCopyPasteInput({
      type: 'codeBlock',
      label: 'bloco de código',
      fields: ['title', 'language', 'code', 'preview', 'previewHtml', 'previewCss', 'tabs'],
    }),
  },
  fieldsets: [
    {
      name: 'customPreview',
      title: 'Prévia personalizada (opcional)',
      options: { collapsible: true, collapsed: true },
    },
  ],
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
      name: 'preview',
      title: 'Mostrar prévia',
      description:
        'Aplica as declarações visuais do código (box-shadow, border-radius, cores…) num card de exemplo acima do código, ou na interface da prévia personalizada. Vale para todas as abas.',
      type: 'boolean',
      initialValue: false,
    }),
    ...previewFields(({ parent }) => !parent?.preview),
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
          fieldsets: [
            {
              name: 'customPreview',
              title: 'Prévia personalizada desta aba (opcional)',
              description: 'Substitui a do bloco só nesta aba.',
              options: { collapsible: true, collapsed: true },
            },
          ],
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
            ...previewFields(),
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
