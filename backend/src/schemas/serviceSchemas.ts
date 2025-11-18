import { z } from 'zod';

export const createServiceSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  icon: z.string().optional(),
  order: z.number().int().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

