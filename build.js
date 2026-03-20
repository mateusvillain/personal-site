import fs from 'node:fs';
import path from 'node:path';
import posthtml from 'posthtml';
import include from 'posthtml-include';

const SRC = path.resolve('src');
const DIST = path.resolve('dist');
const PAGES = path.join(SRC, 'pages');

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

function getHtmlFilesRecursive(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getHtmlFilesRecursive(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(path.relative(PAGES, fullPath));
    }
  }

  return files;
}

/* ---------------- build ---------------- */
console.log('Build iniciado');

const isDev = process.env.NODE_ENV === 'development';

if (!isDev) {
  cleanDist();
}

// assets
copyDir('src/js', 'dist/js');
copyDir('src/lang', 'dist/lang');
copyDir('src/img', 'dist/img');
copyDir('src/fonts', 'dist/fonts');

// pages
const files = getHtmlFilesRecursive(PAGES);

for (const relativeFile of files) {
  const pagePath = path.join(PAGES, relativeFile);
  const rawHtml = fs.readFileSync(pagePath, 'utf-8');

  const is404 = relativeFile === '404.html';
  const pageDir = path.dirname(relativeFile);
  const pageName = path.basename(relativeFile, '.html');
  const result = await posthtml([
    include({ root: SRC })
  ]).process(rawHtml);

  let outputPath;
  if (is404) {
    outputPath = path.join(DIST, '404.html');
  } else if (pageDir === '.') {
    outputPath = pageName === 'index'
      ? path.join(DIST, 'index.html')
      : path.join(DIST, `${pageName}.html`);
  } else if (pageName === 'index') {
    outputPath = path.join(DIST, pageDir, 'index.html');
  } else {
    outputPath = path.join(DIST, pageDir, `${pageName}.html`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.html);

  console.log(`Página gerada: ${relativeFile} -> ${path.relative(DIST, outputPath)}`);
}

console.log('Build finalizado com sucesso');
