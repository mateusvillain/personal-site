import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkHighlight from './src/lib/remark-highlight.mjs';
import remarkMarginNote from './src/lib/remark-margin-note.mjs';

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    // `==trecho==` vira <mark> com o marca-texto dos posts; `^[nota]` no fim
    // do paragrafo vira a nota escrita a mao na margem.
    remarkPlugins: [remarkHighlight, remarkMarginNote],
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
