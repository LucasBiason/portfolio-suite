import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  longDescription: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  imageUrl: z.string().optional(),
  category: z.string().min(2),
  categoryLabel: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

