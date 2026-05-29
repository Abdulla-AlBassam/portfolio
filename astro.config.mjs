import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import keystatic from "@keystatic/astro";

export default defineConfig({
  site: "https://www.abdullaalbassam.com",
  output: "static",
  adapter: vercel(),
  integrations: [svelte(), tailwind(), react(), keystatic()],
});
