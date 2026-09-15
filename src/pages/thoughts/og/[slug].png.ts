import type { APIRoute } from "astro";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { html } from "satori-html";
import fs from "node:fs/promises";
import path from "node:path";
import { getThoughts, type Thought } from "../_thoughts";

const WIDTH = 1200;
const HEIGHT = 627;
const MIDNIGHT = "#272757"; // the site accent, as it is in the light theme
const PAPER = "#f4f3ee";

export async function getStaticPaths() {
  const thoughts = await getThoughts();
  return thoughts.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The share card is the title alone on the midnight blue: nothing else.
export const GET: APIRoute = async ({ props }) => {
  const entry = props.entry as Thought;
  const long = entry.data.title.length > 40;

  const markup = html`
    <div style="width:${WIDTH}px;height:${HEIGHT}px;display:flex;align-items:center;justify-content:center;padding:0 120px;background:${MIDNIGHT};color:${PAPER}">
      <div style="display:flex;text-align:center;font-family:'Newsreader Display';font-size:${long ? 72 : 88}px;font-weight:600;line-height:1.1;letter-spacing:-0.015em">${escape(entry.data.title)}</div>
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
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
};
