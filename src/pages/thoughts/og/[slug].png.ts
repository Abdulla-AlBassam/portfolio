import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { getThoughts, monthYear, type Thought } from "../_thoughts";

const WIDTH = 1200;
const HEIGHT = 627;
const ACCENT = "#9a9ee0"; // the dark-page accent; it reads on the scrim over any photo

export async function getStaticPaths() {
  const thoughts = await getThoughts();
  return thoughts.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as Thought;

  // The cover is square, so cropping to 1.91:1 keeps its middle band only.
  const cover = await sharp(path.join(process.cwd(), "public", entry.data.cover))
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
    .jpeg({ quality: 82 })
    .toBuffer();
  const coverUri = `data:image/jpeg;base64,${cover.toString("base64")}`;

  const eyebrow = `Thoughts · ${monthYear(entry.data.date)}`.toUpperCase();
  const long = entry.data.title.length > 64;

  const markup = html`
    <div style="position:relative;width:${WIDTH}px;height:${HEIGHT}px;display:flex;background:#1a1816;font-family:'Newsreader Text';color:#f4f3ee">
      <img src="${coverUri}" width="${WIDTH}" height="${HEIGHT}" style="position:absolute;left:0;top:0;width:${WIDTH}px;height:${HEIGHT}px;object-fit:cover" />
      <div style="position:absolute;left:0;top:0;width:${WIDTH}px;height:${HEIGHT}px;display:flex;background:linear-gradient(90deg,rgba(20,18,16,0.88) 0%,rgba(20,18,16,0.80) 40%,rgba(20,18,16,0.45) 66%,rgba(20,18,16,0.12) 100%)"></div>
      <div style="position:absolute;left:0;top:0;width:${WIDTH}px;height:${HEIGHT}px;display:flex;background:linear-gradient(180deg,rgba(20,18,16,0) 55%,rgba(20,18,16,0.55) 100%)"></div>
      <div style="position:absolute;left:88px;top:0;width:720px;height:${HEIGHT}px;display:flex;flex-direction:column;justify-content:center;padding-bottom:20px">
        <div style="display:flex;font-size:24px;font-weight:500;letter-spacing:0.06em;color:${ACCENT};margin-bottom:22px">${escape(eyebrow)}</div>
        <div style="display:flex;font-family:'Newsreader Display';font-size:${long ? 54 : 64}px;font-weight:600;line-height:${long ? 1.12 : 1.1};letter-spacing:-0.012em;color:#f4f3ee">${escape(entry.data.title)}</div>
      </div>
      <div style="position:absolute;left:88px;bottom:72px;display:flex;align-items:center;font-size:22px;font-weight:500;letter-spacing:0.02em;color:rgba(244,243,238,0.78)">
        <div style="display:flex;width:8px;height:8px;border-radius:4px;background:${ACCENT};margin-right:14px"></div>abdullaalbassam.com
      </div>
    </div>
  `;

  const fontDir = path.join(process.cwd(), "src/assets/fonts/og");
  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: "Newsreader Display",
        data: await fs.readFile(path.join(fontDir, "Newsreader_60pt-SemiBold.ttf")),
        weight: 600,
        style: "normal",
      },
      {
        name: "Newsreader Text",
        data: await fs.readFile(path.join(fontDir, "Newsreader_24pt-Medium.ttf")),
        weight: 500,
        style: "normal",
      },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
