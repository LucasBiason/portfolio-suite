/**
 * Zod schemas for domain request validation.
 */
import { z } from 'zod';

/** Validates the body of a create domain request. */
export const createDomainSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

/** Validates the body of an update domain request (all fields optional). */
export const updateDomainSchema = createDomainSchema.partial();
