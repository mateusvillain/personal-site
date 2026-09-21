import { defineField, defineType } from 'sanity'

// Substitui a database do Notion (api/project.js + api/projects.js).
// Um doc = um case, com título/slug/conteúdo por idioma e o mesmo
// gate de senha por projeto que já existia (password_key -> env PASSWORD_<key>).
export default defineType({
  name: 'caseStudy',
  title: 'Case (conteúdo confidencial)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Mesmo slug usado na URL/data-slug do site (ex.: locaweb-design-system).',
      options: { source: 'title.pt' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'isPublic',
      title: 'Publicado',
      type: 'boolean',
      description: 'Equivalente ao checkbox "public" do Notion. Se falso, a API responde 404.',
      initialValue: false,
    }),
    defineField({
      name: 'requiresPassword',
      title: 'Exige senha',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'passwordKey',
      title: 'Chave da senha',
      type: 'string',
      description: 'Deve casar com uma env var PASSWORD_<CHAVE> na Vercel (ex.: locaweb_ds).',
      hidden: ({ document }) => !document?.requiresPassword,
    }),
    defineField({
      name: 'coverImage',
      title: 'Imagem de capa',
      type: 'image',
      options: { hotspot: true },
      fields: [{ name: 'alt', type: 'string', title: 'Texto alternativo' }],
    }),
    defineField({
      name: 'content',
      title: 'Conteúdo',
      type: 'localeBlockContent',
    }),
  ],
  preview: {
    select: { title: 'title.pt', subtitle: 'slug.current', isPublic: 'isPublic' },
    prepare({ title, subtitle, isPublic }) {
      return {
        title,
        subtitle: `/${subtitle}${isPublic ? '' : ' · rascunho'}`,
      }
    },
  },
})
