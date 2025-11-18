import { z } from 'zod';

export const updateProfileSchema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().min(2).optional(),
  bio: z.string().min(2).optional(),
  highlights: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional(),
  heroBackgroundUrl: z.string().url().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  footerTitle: z.string().optional(),
  footerDescription: z.string().optional(),
  footerTagline: z.string().optional(),
  sectionProjectsTitle: z.string().optional(),
  sectionProjectsSubtitle: z.string().optional(),
  contactTitle: z.string().optional(),
  contactSubtitle: z.string().optional(),
  contactDescription: z.string().optional(),
});

