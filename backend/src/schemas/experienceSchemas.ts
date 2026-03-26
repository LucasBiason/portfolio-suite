/**
 * Zod schemas for professional experience request validation.
 */
import { z } from 'zod';

/** Validates the body of a create experience request. */
export const createExperienceSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  period: z.string().min(2),
  summary: z.string().min(2),
  order: z.number().int().optional(),
});

/** Validates the body of an update experience request (all fields optional). */
export const updateExperienceSchema = createExperienceSchema.partial();

