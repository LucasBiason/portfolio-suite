/**
 * Data access layer for portfolio services.
 * Provides CRUD operations for the services offered in the portfolio.
 */
import { prisma } from '../config/prisma';
import type { Service } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

/**
 * Data access layer for portfolio services.
 */
export class ServiceRepository {
  /**
   * Lists all services for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of services
   */
  async listPublicByUser(userId: string): Promise<Service[]> {
    return prisma.service.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Lists services with server-side filtering, sorting and pagination.
   *
   * @param userId - The owner's user ID
   * @param opts - Filter, sort and pagination options
   * @returns Paginated result with data, total count and page metadata
   */
  async listFiltered(userId: string, opts: { search?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }) {
    const { search, page = 1, pageSize = 20, sortBy = 'order', sortDir = 'asc' } = opts;
    const where: Record<string, unknown> = { userId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.service.findMany({ where, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.service.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Creates a new service linked to the given user.
   *
   * @param userId - The owner's user ID
   * @param data - Service data
   * @returns The created service
   */
  async create(userId: string, data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    await reorderOnSave('service', 'userId', userId, data.order ?? 0);
    return prisma.service.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Updates a service scoped to the given user.
   *
   * @param id - The service ID
   * @param userId - The owner's user ID
   * @param data - Partial service data
   * @returns The updated service, or null if not found
   */
  async update(id: string, userId: string, data: Partial<Service>): Promise<Service | null> {
    const existing = await prisma.service.findFirst({ where: { id, userId } });
    if (!existing) {
      return null;
    }
    if (data.order !== undefined) {
      await reorderOnSave('service', 'userId', userId, data.order, id);
    }
    return prisma.service.update({ where: { id }, data });
  }

  /**
   * Deletes a service scoped to the given user.
   *
   * @param id - The service ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.service.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.service.delete({ where: { id } });
    return true;
  }
}

