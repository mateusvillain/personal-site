import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE_URL = 'https://mateusvillain.com';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, 'dist');

const ignoredFiles = [
  '404.html',
  'sitemap.xml'
];

const pages = fs
  .readdirSync(DIST_DIR)
  .filter(file =>
    file.endsWith('.html') &&
    !ignoredFiles.includes(file)
  )
  .map(file => {
    if (file === 'index.html') return '/';
    return `/${file.replace('.html', '')}`;
  });

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(url => `
  <url>
    <loc>${SITE_URL}${url}</loc>
  </url>
`).join('')}
</urlset>`;

fs.writeFileSync(
  path.join(DIST_DIR, 'sitemap.xml'),
  sitemap.trim()
);

console.log('sitemap.xml gerado com sucesso');
