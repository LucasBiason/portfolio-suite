/**
 * Zod schemas for contact info request validation.
 */
import { z } from 'zod';

/** Validates the body of a create contact info request. */
export const createContactSchema = z.object({
  title: z.string().min(2),
  value: z.string().min(2),
  href: z.string().optional(),
  icon: z.string().optional(),
  type: z.string().optional(),
  order: z.number().int().optional(),
});

/** Validates the body of an update contact info request (all fields optional). */
export const updateContactSchema = createContactSchema.partial();

