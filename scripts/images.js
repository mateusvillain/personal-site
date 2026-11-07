import sharp from "sharp";
import { glob } from "glob";
import fs from "fs";
import path from "path";

const DIST_DIR = path.resolve("dist");

// Larguras extras (alem da original) para imagens com `sizes` no HTML. Viram
// `<nome>-<largura>.webp` e entram no srcset do <source>.
const RESPONSIVE_WIDTHS = {
  "dscover.png": [330],
};

// 1. Gerar WebP dentro do dist
const imageFiles = await glob(`${DIST_DIR}/img/**/*.{jpg,jpeg,png}`);

for (const file of imageFiles) {
  const webpPath = file.replace(/\.(jpg|jpeg|png)$/i, ".webp");

  await sharp(file)
    .webp({ quality: 80 })
    .toFile(webpPath);

  console.log(`WebP gerado: ${path.basename(webpPath)}`);

  for (const width of RESPONSIVE_WIDTHS[path.basename(file)] ?? []) {
    const variantPath = webpPath.replace(/\.webp$/, `-${width}.webp`);
    await sharp(file).resize({ width }).webp({ quality: 80 }).toFile(variantPath);
    console.log(`WebP gerado: ${path.basename(variantPath)}`);
  }
}

// srcset do <source>: so a WebP original, ou as variantes + original com
// descritores de largura quando a imagem tem `sizes` e entrada no mapa acima.
function webpSrcset(src, attrs) {
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  const widths = RESPONSIVE_WIDTHS[path.basename(src)];
  const sizes = attrs.match(/\ssizes="([^"]+)"/)?.[1];
  const width = attrs.match(/\swidth="(\d+)"/)?.[1];
  if (!widths || !sizes || !width) return `srcset="${webpSrc}"`;

  const candidates = widths.map(
    (w) => `${webpSrc.replace(/\.webp$/, `-${w}.webp`)} ${w}w`
  );
  candidates.push(`${webpSrc} ${width}w`);
  return `srcset="${candidates.join(", ")}" sizes="${sizes}"`;
}

// 2. Transformar HTML já pronto no dist
const htmlFiles = await glob(`${DIST_DIR}/**/*.html`);

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, "utf-8");

  content = content.replace(
    /<img([^>]+?)src="([^"]+\.(jpg|jpeg|png))"([^>]*)>/gi,
    (match, before, src, ext, after) => {
      return `<picture>
  <source ${webpSrcset(src, `${before} ${after}`)} type="image/webp">
  <img ${before}src="${src}"${after}>
</picture>`;
    }
  );

  fs.writeFileSync(file, content);
  console.log(`HTML atualizado: ${path.basename(file)}`);
}

console.log("Otimização finalizada.");
