/**
 * Zod schemas for service request validation.
 */
import { z } from 'zod';

/** Validates the body of a create service request. */
export const createServiceSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

/** Validates the body of an update service request (all fields optional). */
export const updateServiceSchema = createServiceSchema.partial();

