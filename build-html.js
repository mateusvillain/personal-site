import fs from 'fs';
import path from 'path';

const MANIFEST_FILE = './manifest.json';
const TEMPLATE_DIR = './templates';
const OUTPUT_DIR = './public';

const pages = [
  {
    template: 'index.template.html',
    output: 'index.html'
  },
  {
    template: 'locaweb-design-system.template.html',
    output: 'locaweb-design-system.html'
  }
];

const manifest = JSON.parse(
  fs.readFileSync(MANIFEST_FILE, 'utf8')
);

pages.forEach(({ template, output }) => {
  const templatePath = path.join(TEMPLATE_DIR, template);
  const outputPath = path.join(OUTPUT_DIR, output);

  let html = fs.readFileSync(templatePath, 'utf8');

  Object.entries(manifest).forEach(([original, hashed]) => {
    const placeholder = `{{ ${original} }}`;
    const finalPath = `/dist/${hashed}`;

    html = html.split(placeholder).join(finalPath);
  });

  fs.writeFileSync(outputPath, html);
  console.log(`✔ ${output} gerado em /public`);
});
