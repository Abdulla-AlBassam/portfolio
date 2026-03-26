import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const PHOTO_DIR = join(process.cwd(), "public", "photography");
const THUMB_DIR = join(PHOTO_DIR, "thumbs");
const MID_DIR = join(PHOTO_DIR, "mid");
const THUMB_WIDTH = 400;
const MID_WIDTH = 1200;
const VALID_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

mkdirSync(THUMB_DIR, { recursive: true });
mkdirSync(MID_DIR, { recursive: true });

const files = readdirSync(PHOTO_DIR).filter((f) => {
  const ext = extname(f).toLowerCase();
  return VALID_EXTS.has(ext) && !f.startsWith(".");
});

console.log(`Processing ${files.length} photos...`);

let thumbsDone = 0;
let thumbsSkipped = 0;
let midDone = 0;
let midSkipped = 0;

await Promise.all(
  files.map(async (file) => {
    const src = join(PHOTO_DIR, file);
    const outName = file.replace(/\.\w+$/, ".webp");

    // Generate thumbnail (400px)
    const thumbDest = join(THUMB_DIR, outName);
    if (existsSync(thumbDest)) {
      thumbsSkipped++;
    } else {
      await sharp(src)
        .rotate()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbDest);
      thumbsDone++;
    }

    // Generate mid-res (1200px)
    const midDest = join(MID_DIR, outName);
    if (existsSync(midDest)) {
      midSkipped++;
    } else {
      await sharp(src)
        .rotate()
        .resize({ width: MID_WIDTH, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(midDest);
      midDone++;
    }
  })
);

console.log(`Thumbs: ${thumbsDone} generated, ${thumbsSkipped} skipped.`);
console.log(`Mid-res: ${midDone} generated, ${midSkipped} skipped.`);
