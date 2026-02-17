import { defineCollection, z } from "astro:content";

export const collections = {
  blog: defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      cover: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
};
