import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// One MDX file per article: src/content/thoughts/<slug>.mdx
// Its images live in public/thoughts/<slug>/ and are referenced by absolute path.
const thoughts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/thoughts" }),
  schema: z.object({
    title: z.string().max(90),
    description: z.string().max(200),
    date: z.coerce.date(),
    cover: z.string().startsWith("/thoughts/"),
    coverAlt: z.string().default(""),
    draft: z.boolean().default(false),
  }),
});

export const collections = { thoughts };
