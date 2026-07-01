import sharp from "sharp";
import { glob } from "glob";
import fs from "fs";
import path from "path";

const DIST_DIR = path.resolve("dist");

// 1. Gerar WebP dentro do dist
const imageFiles = await glob(`${DIST_DIR}/img/*.{jpg,jpeg,png}`);

for (const file of imageFiles) {
  const webpPath = file.replace(/\.(jpg|jpeg|png)$/i, ".webp");

  await sharp(file)
    .webp({ quality: 80 })
    .toFile(webpPath);

  console.log(`WebP gerado: ${path.basename(webpPath)}`);
}

// 2. Transformar HTML já pronto no dist
const htmlFiles = await glob(`${DIST_DIR}/**/*.html`);

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, "utf-8");

  content = content.replace(
    /<img([^>]+?)src="([^"]+\.(jpg|jpeg|png))"([^>]*)>/gi,
    (match, before, src, ext, after) => {
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");

      return `<picture>
  <source srcset="${webpSrc}" type="image/webp">
  <img ${before}src="${src}"${after}>
</picture>`;
    }
  );

  fs.writeFileSync(file, content);
  console.log(`HTML atualizado: ${path.basename(file)}`);
}

console.log("Otimização finalizada.");
