/**
 * Zod schemas for category request validation.
 */
import { z } from 'zod';

/** Validates the body of a create category request. */
export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

/** Validates the body of an update category request (all fields optional). */
export const updateCategorySchema = createCategorySchema.partial();
