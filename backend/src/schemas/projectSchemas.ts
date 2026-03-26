/**
 * Zod schemas for project request validation.
 */
import { z } from 'zod';

/** Validates a single project image entry. */
const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  order: z.number().int().optional(),
});

/** Validates the body of a create project request. */
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

/** Validates the body of an update project request (all fields optional). */
export const updateProjectSchema = createProjectSchema.partial();
