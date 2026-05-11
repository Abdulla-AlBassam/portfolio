import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://www.abdullaalbassam.com",
  output: "static",
  integrations: [svelte(), tailwind()],
});
