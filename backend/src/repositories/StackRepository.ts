/**
 * Data access layer for technology stack entries.
 * Handles listing, filtering, creation, update and deletion with category relations.
 */
import { prisma } from '../config/prisma';
import type { StackDetail } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

const stackInclude = {
  category: { select: { id: true, name: true, slug: true, color: true, icon: true } },
};

/**
 * Data access layer for technology stack entries.
 */
export class StackRepository {
  /**
   * Lists all stack entries for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of stack details with category info
   */
  async listPublicByUser(userId: string) {
    return prisma.stackDetail.findMany({
      where: { userId },
      include: stackInclude,
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Lists stack entries with server-side filtering, sorting and pagination.
   *
   * @param userId - The owner's user ID
   * @param opts - Filter, sort and pagination options
   * @returns Paginated result with data, total count and page metadata
   */
  async listFiltered(userId: string, opts: {
    search?: string;
    categoryFilter?: string;
    levelFilter?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { search, categoryFilter, levelFilter, page = 1, pageSize = 20, sortBy = 'order', sortDir = 'asc' } = opts;

    const where: Record<string, unknown> = { userId };

    if (categoryFilter) {
      where.categoryId = categoryFilter;
    }

    if (levelFilter) {
      where.level = levelFilter;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const orderBy = sortBy === 'category'
      ? { category: { name: sortDir } }
      : { [sortBy]: sortDir };

    const [data, total] = await Promise.all([
      prisma.stackDetail.findMany({
        where,
        include: stackInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.stackDetail.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Creates a new stack entry linked to the given user.
   *
   * @param userId - The owner's user ID
   * @param data - Stack detail data
   * @returns The created stack detail with category info
   */
  async create(userId: string, data: Omit<StackDetail, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    await reorderOnSave('stackDetail', 'userId', userId, data.order);
    return prisma.stackDetail.create({
      data: { ...data, userId },
      include: stackInclude,
    });
  }

  /**
   * Updates a stack entry scoped to the given user.
   *
   * @param id - The stack detail ID
   * @param userId - The owner's user ID
   * @param data - Partial stack detail data
   * @returns The updated entry, or null if not found
   */
  async update(id: string, userId: string, data: Partial<StackDetail>) {
    const existing = await prisma.stackDetail.findFirst({ where: { id, userId } });
    if (!existing) return null;
    if (data.order !== undefined) {
      await reorderOnSave('stackDetail', 'userId', userId, data.order, id);
    }
    return prisma.stackDetail.update({ where: { id }, data, include: stackInclude });
  }

  /**
   * Deletes a stack entry scoped to the given user.
   *
   * @param id - The stack detail ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.stackDetail.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.stackDetail.delete({ where: { id } });
    return true;
  }
}
