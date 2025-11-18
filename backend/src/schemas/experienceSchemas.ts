import { z } from 'zod';

export const createExperienceSchema = z.object({
  company: z.string().min(2),
  role: z.string().min(2),
  period: z.string().min(2),
  summary: z.string().min(2),
  order: z.number().int().optional(),
});

export const updateExperienceSchema = createExperienceSchema.partial();

