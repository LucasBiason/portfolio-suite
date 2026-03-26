/**
 * Zod schemas for authentication request validation.
 */
import { z } from 'zod';

/** Validates the body of a user registration request. */
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2),
  slug: z.string().min(2).optional(),
});

/** Validates the body of a login request. */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

