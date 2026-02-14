import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE_URL = 'https://mateusvillain.com';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, 'dist');

const ignoredFiles = ['404.html', 'sitemap.xml'];

// função recursiva para pegar todos os html
function getAllHtmlFiles(dir, basePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  let files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getAllHtmlFiles(fullPath, relativePath));
    } else if (
      entry.name.endsWith('.html') &&
      !ignoredFiles.includes(entry.name)
    ) {
      files.push(relativePath);
    }
  }

  return files;
}

const htmlFiles = getAllHtmlFiles(DIST_DIR);

const pages = htmlFiles.map(file => {
  if (file === 'index.html') return '/';

  if (file.endsWith('/index.html')) {
    return `/${file.replace('/index.html', '')}`;
  }

  return `/${file.replace('.html', '')}`;
});

function getPriority(url) {
  if (url === '/') return '1.0';
  if (url === '/blog') return '0.8';
  if (url === '/locaweb-design-system') return '0.8';
  if (url.startsWith('/blog/')) return '0.7';
  return '0.6';
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(url => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <priority>${getPriority(url)}</priority>
  </url>
`).join('')}
</urlset>`;

fs.writeFileSync(
  path.join(DIST_DIR, 'sitemap.xml'),
  sitemap.trim()
);

console.log('sitemap.xml gerado com sucesso!');
