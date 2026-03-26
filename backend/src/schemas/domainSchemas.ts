import { z } from 'zod';

export const createDomainSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().int().optional(),
});

export const updateDomainSchema = createDomainSchema.partial();
