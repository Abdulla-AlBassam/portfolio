import sharp from "sharp";
import {
  readdirSync,
  statSync,
  renameSync,
  copyFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";

const PHOTO_DIR = join(process.cwd(), "public", "photography");
const BW_DIR = join(PHOTO_DIR, "bw");
const COLOR_DIR = join(PHOTO_DIR, "color");
const SAT_THRESHOLD = 0.04;

const args = process.argv.slice(2);
const importArg = args.find((a) => a.startsWith("--import="));
const importDir = importArg ? importArg.split("=")[1] : null;
const dryRun = args.includes("--dry-run");

mkdirSync(BW_DIR, { recursive: true });
mkdirSync(COLOR_DIR, { recursive: true });

async function meanChroma(filepath) {
  const { data } = await sharp(filepath)
    .rotate()
    .resize(64, 64, { fit: "inside" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let sum = 0;
  const px = data.length / 3;
  for (let i = 0; i < data.length; i += 3) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    sum += (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  }
  return sum / px;
}

const targets = [];

for (const f of readdirSync(PHOTO_DIR)) {
  const full = join(PHOTO_DIR, f);
  if (statSync(full).isFile() && /\.(jpe?g|png)$/i.test(f)) {
    targets.push({ src: full, name: f, move: true });
  }
}

if (importDir) {
  for (const f of readdirSync(importDir)) {
    const full = join(importDir, f);
    if (statSync(full).isFile() && /\.(jpe?g|png)$/i.test(f)) {
      targets.push({ src: full, name: f, move: false });
    }
  }
}

console.log(`Classifying ${targets.length} photos (threshold ${SAT_THRESHOLD})...`);

const results = await Promise.all(
  targets.map(async (t) => {
    const sat = await meanChroma(t.src);
    return { ...t, sat, cat: sat < SAT_THRESHOLD ? "bw" : "color" };
  })
);

results.sort((a, b) => a.sat - b.sat);

let bw = 0,
  color = 0,
  skipped = 0;
for (const r of results) {
  const dest = join(r.cat === "bw" ? BW_DIR : COLOR_DIR, r.name);
  if (existsSync(dest)) {
    skipped++;
    continue;
  }
  if (!dryRun) {
    if (r.move) renameSync(r.src, dest);
    else copyFileSync(r.src, dest);
  }
  if (r.cat === "bw") bw++;
  else color++;
}

console.log(`Result: ${bw} B&W, ${color} colour, ${skipped} already in place.`);
console.log("\nBorderline cases (sat 0.03 – 0.12) for manual review:");
for (const r of results.filter((r) => r.sat > 0.03 && r.sat < 0.12)) {
  console.log(`  [${r.cat.padEnd(5)}] sat=${r.sat.toFixed(4)}  ${r.name}`);
}
