/**
 * Data access layer for user profile records.
 */
import { prisma } from '../config/prisma';
import type { Profile } from '@prisma/client';

/**
 * Handles database operations for user profiles via Prisma.
 */
export class ProfileRepository {
  /**
   * Retrieves the profile for the given user ID.
   *
   * @param userId - The owner's user ID
   * @returns The profile record, or null if not found
   */
  async getByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  }

  /**
   * Updates the profile for the given user ID.
   *
   * @param userId - The owner's user ID
   * @param data - Partial profile data to apply
   * @returns The updated profile record
   */
  async update(userId: string, data: Partial<Profile>): Promise<Profile> {
    return prisma.profile.update({
      where: { userId },
      data,
    });
  }

  /**
   * Retrieves the public profile for an active user by slug.
   *
   * @param slug - The user's public slug
   * @returns The profile with its user, or null if not found or inactive
   */
  async getPublicProfileBySlug(slug: string): Promise<Profile | null> {
    return prisma.profile.findFirst({
      where: { user: { slug, active: true } },
      include: { user: true },
    });
  }
}

