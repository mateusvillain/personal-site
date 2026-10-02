import { defineCollection, z } from 'astro:content'
import { file, glob } from 'astro/loaders'
import { resourceCategories } from './i18n/resources'

/**
 * Posts do blog, um arquivo por idioma:
 *
 *   src/content/blog/en/<key>.md   -> /blog/<slug>/
 *   src/content/blog/pt/<key>.md   -> /pt/blog/<slug>/
 *
 * O nome do arquivo (`key`) e o que liga as traducoes entre si; o `slug`
 * da URL pode ser sobrescrito no frontmatter para ficar no idioma do post.
 * Veja `src/lib/posts.ts` para os helpers.
 */
export const collections = {
  blog: defineCollection({
    loader: glob({
      // O README.md da pasta documenta como escrever os posts; nao e post.
      pattern: ['**/*.md', '!README.md'],
      base: './src/content/blog',
      // O id e sempre o caminho do arquivo (`en/chave`, `pt/chave`); o
      // glob, por padrao, usaria o `slug` do frontmatter e perderia o idioma.
      generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
    }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      cover: z.string().optional(),
      tags: z.array(z.string()).optional(),
      slug: z.string().optional(),
    }),
  }),

  /**
   * Sites recomendados da pagina de recursos (a pagina ordena pelo nome). O
   * formato de cada entrada esta documentado no proprio YAML.
   */
  resources: defineCollection({
    loader: file('src/content/resources.yaml'),
    schema: z.object({
      name: z.string(),
      url: z.string().url(),
      icon: z.string().optional(),
      category: z.enum(resourceCategories),
    }),
  }),
}
