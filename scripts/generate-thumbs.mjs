import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const PHOTO_DIR = join(process.cwd(), "public", "photography");
const THUMB_DIR = join(PHOTO_DIR, "thumbs");
const THUMB_WIDTH = 400;
const VALID_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

mkdirSync(THUMB_DIR, { recursive: true });

const files = readdirSync(PHOTO_DIR).filter((f) => {
  const ext = extname(f).toLowerCase();
  return VALID_EXTS.has(ext) && !f.startsWith(".");
});

console.log(`Generating ${files.length} thumbnails...`);

let done = 0;
let skipped = 0;

await Promise.all(
  files.map(async (file) => {
    const src = join(PHOTO_DIR, file);
    const outName = file.replace(/\.\w+$/, ".webp");
    const dest = join(THUMB_DIR, outName);

    if (existsSync(dest)) {
      skipped++;
      return;
    }

    await sharp(src)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(dest);

    done++;
  })
);

console.log(`Done: ${done} generated, ${skipped} skipped (already exist).`);
