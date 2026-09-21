import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
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
