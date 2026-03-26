import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  order: z.number().int().optional(),
});

export const createProjectSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  longDescription: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().optional(),
  category: z.string().min(2).optional(),
  categoryLabel: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  images: z.array(imageSchema).optional(),
  categoryIds: z.array(z.string()).optional(),
  stackIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();
