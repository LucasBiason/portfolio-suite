import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor hexadecimal inválida');

export const updateSettingsSchema = z.object({
  primaryColor: hexColor.optional(),
  primaryDarkColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  accentSoftColor: hexColor.optional(),
  backgroundColor: hexColor.optional(),
  surfaceColor: hexColor.optional(),
  textColor: hexColor.optional(),
  headerFont: z.string().min(1).optional(),
  bodyFont: z.string().min(1).optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  contactEmail: z.string().optional(),
  // Page configs
  projectsPageTitle: z.string().optional(),
  projectsPageSubtitle: z.string().optional(),
  projectsGithubUrl: z.string().optional(),
  projectsGithubLabel: z.string().optional(),
  projectsGithubHint: z.string().optional(),
  careerPageTitle: z.string().optional(),
  careerPageSubtitle: z.string().optional(),
  stacksPageTitle: z.string().optional(),
  stacksPageSubtitle: z.string().optional(),
});
