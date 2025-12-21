import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const folders = ['css', 'js', 'img'];
const OUTPUT_ROOT = './public/dist';
const manifest = {};

// Garante a pasta public/dist
if (!fs.existsSync(OUTPUT_ROOT)) {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
}

folders.forEach(folder => {
  const inputDir = `./${folder}`;
  const outputDir = path.join(OUTPUT_ROOT, folder);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.readdirSync(inputDir).forEach(file => {
    const inputFile = path.join(inputDir, file);

    if (fs.lstatSync(inputFile).isDirectory()) return;

    const content = fs.readFileSync(inputFile);
    const hash = crypto
      .createHash('md5')
      .update(content)
      .digest('hex')
      .slice(0, 8);

    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const hashedFile = `${name}.${hash}${ext}`;

    fs.writeFileSync(
      path.join(outputDir, hashedFile),
      content
    );

    // Ex: css/style.css → css/style.a83d9f2c.css
    manifest[`${folder}/${file}`] = `${folder}/${hashedFile}`;
  });
});

// Salva o manifest na raiz
fs.writeFileSync(
  './manifest.json',
  JSON.stringify(manifest, null, 2)
);

console.log('✔ Assets gerados com hash');
