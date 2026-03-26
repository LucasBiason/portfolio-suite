/**
 * Data access layer for professional experience records.
 */
import { prisma } from '../config/prisma';
import type { Experience } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

/**
 * Abstracts database access for professional experience entries.
 */
export class ExperienceRepository {
  /**
   * Lists all experience records for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of experience records
   */
  async listPublicByUser(userId: string): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Creates a new experience record linked to the given user.
   *
   * @param userId - The owner's user ID
   * @param data - Experience data
   * @returns The created experience record
   */
  async create(userId: string, data: Omit<Experience, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Experience> {
    await reorderOnSave('experience', 'userId', userId, data.order ?? 0);
    return prisma.experience.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Updates an experience record scoped to the given user.
   *
   * @param id - The experience ID
   * @param userId - The owner's user ID
   * @param data - Partial experience data
   * @returns The updated record, or null if not found
   */
  async update(id: string, userId: string, data: Partial<Experience>): Promise<Experience | null> {
    const existing = await prisma.experience.findFirst({ where: { id, userId } });
    if (!existing) {
      return null;
    }
    if (data.order !== undefined) {
      await reorderOnSave('experience', 'userId', userId, data.order, id);
    }
    return prisma.experience.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes an experience record scoped to the given user.
   *
   * @param id - The experience ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.experience.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.experience.delete({ where: { id } });
    return true;
  }
}

