import { z } from 'zod';

export const createContactSchema = z.object({
  title: z.string().min(2),
  value: z.string().min(2),
  href: z.string().optional(),
  icon: z.string().optional(),
  type: z.string().optional(),
  order: z.number().int().optional(),
});

export const updateContactSchema = createContactSchema.partial();

