import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";

/**
 * Turns a paragraph that holds nothing but an image with a title into a
 * figure with a caption, so an article can write:
 *
 *   ![alt text](/thoughts/slug/chart.png "The caption.")
 *
 * Charts with a transparent background use <figure class="chart"> in the MDX
 * directly, which puts them on a card that reads on both themes.
 */
function remarkFigureCaption() {
  const walk = (node) => {
    if (!node.children) return;
    for (const child of node.children) walk(child);
    if (node.type !== "paragraph" || node.children.length !== 1) return;
    const image = node.children[0];
    if (image.type !== "image" || !image.title) return;
    const caption = image.title;
    image.title = null;
    node.data = { ...node.data, hName: "figure" };
    node.children = [
      image,
      {
        type: "emphasis",
        data: { hName: "figcaption" },
        children: [{ type: "text", value: caption }],
      },
    ];
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: "https://www.abdullaalbassam.com",
  output: "static",
  integrations: [svelte(), tailwind(), mdx()],
  markdown: {
    remarkPlugins: [remarkFigureCaption],
  },
});
