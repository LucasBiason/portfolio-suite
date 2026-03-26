/**
 * Data access layer for site settings.
 */
import { prisma } from '../config/prisma';

/**
 * Handles database access for site settings (colors, fonts, SMTP config).
 */
export class SettingsRepository {
  /**
   * Retrieves site settings for the given user.
   *
   * @param userId - The owner's user ID
   * @returns The settings record, or null if not configured
   */
  async getByUser(userId: string) {
    return prisma.siteSettings.findUnique({ where: { userId } });
  }

  /**
   * Retrieves site settings for public use (same data as getByUser, filtering happens in the controller).
   *
   * @param userId - The owner's user ID
   * @returns The settings record, or null if not configured
   */
  async getByUserPublic(userId: string) {
    return prisma.siteSettings.findUnique({ where: { userId } });
  }

  /**
   * Creates or updates site settings for the given user.
   *
   * @param userId - The owner's user ID
   * @param data - Settings key-value pairs to apply
   * @returns The upserted settings record
   */
  async upsert(userId: string, data: Record<string, string>) {
    return prisma.siteSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
