/**
 * Zod schemas for technology stack request validation.
 */
import { z } from 'zod';

/** Validates the body of a create stack entry request. */
export const createStackSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().min(1),
  startYear: z.number().int().min(1970).max(2100),
  endYear: z.number().int().min(1970).max(2100).nullable().optional(),
  level: z.string().min(1),
  icon: z.string().optional(),
  profProjects: z.array(z.string()).default([]),
  personalProjects: z.array(z.string()).default([]),
  solutions: z.array(z.string()).default([]),
  patterns: z.array(z.string()).default([]),
  order: z.number().int().optional(),
});

/** Validates the body of an update stack entry request (all fields optional). */
export const updateStackSchema = createStackSchema.partial();
