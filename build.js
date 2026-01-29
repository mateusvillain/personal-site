import fs from 'node:fs';
import path from 'node:path';
import posthtml from 'posthtml';
import include from 'posthtml-include';

const SRC = path.resolve('src');
const DIST = path.resolve('dist');
const PAGES = path.join(SRC, 'pages');
const LAYOUT = path.join(SRC, 'layouts', 'default.html');

/* ---------------- utils ---------------- */
function cleanDist() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function extractMeta(html) {
  const match = html.match(/<!--([\s\S]*?)-->/);
  if (!match) return { meta: {}, content: html };

  const meta = {};
  match[1]
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .forEach(line => {
      const [key, ...rest] = line.split(':');
      meta[key.trim()] = rest.join(':').trim();
    });

  const content = html.replace(match[0], '').trim();
  return { meta, content };
}

function injectMeta(html, meta) {
  return html.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    return meta[key.trim()] || '';
  });
}

/* ---------------- build ---------------- */
console.log('▶ Build iniciado');

const isDev = process.env.NODE_ENV === 'development';

if (!isDev) {
  cleanDist();
}

// assets
copyDir('src/js', 'dist/js');
copyDir('src/lang', 'dist/lang');
copyDir('src/img', 'dist/img');

// layout
const layoutHtml = fs.readFileSync(LAYOUT, 'utf-8');

// pages
const files = fs.readdirSync(PAGES).filter(f => f.endsWith('.html'));

for (const file of files) {
  const pagePath = path.join(PAGES, file);
  const rawHtml = fs.readFileSync(pagePath, 'utf-8');

  const is404 = file === '404.html';
  const { meta, content } = extractMeta(rawHtml);

  const headInclude = is404
    ? '<include src="partials/404-head.html"></include>'
    : '<include src="partials/head.html"></include>';

  const composedHtml = layoutHtml
    .replace('{{head}}', headInclude)
    .replace('{{content}}', content);

  const result = await posthtml([
    include({ root: SRC })
  ]).process(composedHtml);

  const finalHtml = is404
    ? result.html
    : injectMeta(result.html, meta);

  fs.writeFileSync(
    path.join(DIST, file),
    finalHtml
  );

  console.log(`✔ Página gerada: ${file}`);
}

console.log('✔ Build finalizado com sucesso');
