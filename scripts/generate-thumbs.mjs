import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const PHOTO_DIR = join(process.cwd(), "public", "photography");
const CATEGORIES = ["bw", "color"];
const THUMB_WIDTH = 400;
const MID_WIDTH = 1200;
const VALID_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

let totalDone = 0;
let totalSkipped = 0;

for (const cat of CATEGORIES) {
  const catDir = join(PHOTO_DIR, cat);
  if (!existsSync(catDir)) continue;

  const thumbDir = join(catDir, "thumbs");
  const midDir = join(catDir, "mid");
  mkdirSync(thumbDir, { recursive: true });
  mkdirSync(midDir, { recursive: true });

  const files = readdirSync(catDir).filter((f) => {
    const full = join(catDir, f);
    if (!statSync(full).isFile()) return false;
    const ext = extname(f).toLowerCase();
    return VALID_EXTS.has(ext) && !f.startsWith(".");
  });

  console.log(`[${cat}] Processing ${files.length} photos...`);

  await Promise.all(
    files.map(async (file) => {
      const src = join(catDir, file);
      const outName = file.replace(/\.\w+$/, ".webp");

      const thumbDest = join(thumbDir, outName);
      if (existsSync(thumbDest)) {
        totalSkipped++;
      } else {
        await sharp(src)
          .rotate()
          .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(thumbDest);
        totalDone++;
      }

      const midDest = join(midDir, outName);
      if (existsSync(midDest)) {
        totalSkipped++;
      } else {
        await sharp(src)
          .rotate()
          .resize({ width: MID_WIDTH, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(midDest);
        totalDone++;
      }
    })
  );
}

console.log(`Total: ${totalDone} generated, ${totalSkipped} skipped.`);
