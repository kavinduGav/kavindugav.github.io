import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Longer one- or two-sentence summary shown in the /work/[slug] header.
    summary: z.string(),
    tag: z.string(),
    category: z.enum(["Web", "Mobile", "Research"]),
    // Controls ordering on the Home grid and the /work/[slug] "next project" chain.
    order: z.number(),
    // Caption for the placeholder media shown on the Home card.
    homeMedia: z.string(),
    // Set only for entries that link out instead of to /work/[slug] (e.g. Research).
    href: z.string().optional(),
    role: z.string(),
    company: z.string(),
    timeline: z.string(),
    platforms: z.string(),
    problem: z.string(),
    approach: z.string(),
    outcome: z.string(),
    tech: z.array(z.string()),
    heroCaption: z.string(),
    screenshots: z.array(
      z.object({
        // Small mono label inside the striped placeholder (e.g. "screenshot: admin dashboard").
        media: z.string(),
        // Readable figcaption shown below the placeholder.
        caption: z.string(),
        wide: z.boolean().optional(),
      }),
    ),
  }),
});

export const collections = { projects };
