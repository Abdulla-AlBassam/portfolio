import { defineCollection, z } from "astro:content";

// Blog collection – ready for when you want to add posts.
// Just create .md or .mdx files in src/content/blog/
// Each file needs frontmatter matching this schema.
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
