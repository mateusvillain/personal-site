import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkHighlight from './src/lib/remark-highlight.mjs';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    // `==trecho==` vira <mark> com o marca-texto dos posts.
    remarkPlugins: [remarkHighlight],
  },
  site: 'https://www.mateusvillain.com',
  trailingSlash: 'ignore',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', { path: 'pt', codes: ['pt-BR', 'pt'] }],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
