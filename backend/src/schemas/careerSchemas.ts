/**
 * Zod schemas for career entry request validation.
 */
import { z } from 'zod';

/** Validates the body of a create career entry request. */
export const createCareerSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  contractType: z.enum(['CLT', 'PJ', 'Freelancer']).optional(),
  startDate: z.string(), // ISO date string
  endDate: z.string().optional().nullable(),
  summary: z.string().min(2),
  projectTypes: z.array(z.string()).default([]),
  actions: z.array(z.string()).default([]),
  order: z.number().int().optional(),
  stackIds: z.array(z.string()).optional(),
  domainIds: z.array(z.string()).optional(),
});

/** Validates the body of an update career entry request (all fields optional). */
export const updateCareerSchema = createCareerSchema.partial();
