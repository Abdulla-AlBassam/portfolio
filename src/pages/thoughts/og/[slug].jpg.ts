import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { getThoughts, type Thought } from "../_thoughts";

const WIDTH = 1200;
const HEIGHT = 627;
// Rasterised at 2x so the title stays crisp after LinkedIn and WhatsApp resample it.
const SCALE = 2;

// Site colours: the dark page, the midnight accent, its lifted dark-theme cut, and the paper.
const INK = "#262320";
const MIDNIGHT = "#272757";
const CORE = "#3b3b8f";
const LIFT = "#9a9ee0";
const PAPER = "#f4f3ee";

export async function getStaticPaths() {
  const thoughts = await getThoughts();
  return thoughts.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

type Stop = [offset: number, colour: string, opacity: number];
const gradient = (id: string, stops: Stop[]) =>
  `<radialGradient id="${id}">${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</radialGradient>`;
const blob = (id: string, cx: number, cy: number, rx: number, ry: number, rotate: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" transform="rotate(${rotate} ${cx} ${cy})"/>`;

// The share card: the title over a mesh of the page dark and the midnight blue.
// Satori sets the type; the mesh is plain SVG (soft radial blobs and a grain
// filter) that Satori cannot express, so the two are spliced together before
// resvg rasterises them. The grain makes a PNG huge, hence the JPEG.
export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as Thought;
  const long = entry.data.title.length > 40;

  const markup = html`
    <div style="width:${WIDTH}px;height:${HEIGHT}px;display:flex;align-items:center;justify-content:center;padding:0 120px;color:${PAPER}">
      <div style="display:flex;text-align:center;font-family:'Newsreader Display';font-size:${long ? 72 : 88}px;font-weight:600;line-height:1.1;letter-spacing:-0.015em">${escape(entry.data.title)}</div>
    </div>
  `;

  const fontDir = path.join(process.cwd(), "src/assets/fonts/og");
  const titleSvg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Newsreader Display",
        data: await fs.readFile(path.join(fontDir, "Newsreader_60pt-SemiBold.ttf")),
        weight: 600,
        style: "normal",
      },
    ],
  });
  const title = titleSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    ${gradient("blue", [[0, MIDNIGHT, 1], [0.55, MIDNIGHT, 0.8], [1, MIDNIGHT, 0]])}
    ${gradient("core", [[0, CORE, 0.95], [0.5, CORE, 0.45], [1, CORE, 0]])}
    ${gradient("rim", [[0, LIFT, 0.7], [0.45, LIFT, 0.22], [1, LIFT, 0]])}
    ${gradient("dark", [[0, INK, 1], [0.55, INK, 0.85], [1, INK, 0]])}
    ${gradient("faint", [[0, MIDNIGHT, 0.6], [1, MIDNIGHT, 0]])}
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch" seed="3"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.11" intercept="0"/></feComponentTransfer>
    </filter>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${INK}"/>
  ${blob("blue", 980, 560, 820, 520, -22)}
  ${blob("core", 1060, 640, 420, 300, -22)}
  ${blob("rim", 1120, 130, 380, 170, 18)}
  ${blob("dark", 330, 300, 620, 470, 12)}
  ${blob("faint", 120, 40, 420, 260, 0)}
  <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#grain)"/>
  ${title}
</svg>`;

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH * SCALE } }).render().asPng();
  const jpg = await sharp(png).jpeg({ quality: 80, chromaSubsampling: "4:4:4" }).toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { "Content-Type": "image/jpeg" } });
};
