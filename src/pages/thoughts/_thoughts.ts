import { getCollection, type CollectionEntry } from "astro:content";

export type Thought = CollectionEntry<"thoughts">;

/** Published articles, newest first. Drafts show in dev and never in a build. */
export async function getThoughts(): Promise<Thought[]> {
  const entries = await getCollection("thoughts", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Frontmatter dates parse as UTC midnight, so both formatters read the date in
// UTC. Reading it locally would push a 1st-of-month date into the month before
// whenever the build machine sits west of UTC.

/** "September 2026" */
export function monthYear(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-09", for the datetime attribute. */
export function monthStamp(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
