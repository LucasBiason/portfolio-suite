/**
 * Data access layer for contact info records (contact cards and social links).
 */
import { prisma } from '../config/prisma';
import type { ContactInfo } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

/**
 * Centralises access to contact info records for a user.
 */
export class ContactRepository {
  /**
   * Lists all contact records for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of contact info records
   */
  async listPublicByUser(userId: string): Promise<ContactInfo[]> {
    return prisma.contactInfo.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Lists contact records with server-side filtering, sorting and pagination.
   *
   * @param userId - The owner's user ID
   * @param opts - Filter, sort and pagination options
   * @returns Paginated result with data, total count and page metadata
   */
  async listFiltered(userId: string, opts: { search?: string; typeFilter?: string; page?: number; pageSize?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }) {
    const { search, typeFilter, page = 1, pageSize = 20, sortBy = 'order', sortDir = 'asc' } = opts;
    const where: Record<string, unknown> = { userId };
    if (typeFilter) where.type = typeFilter;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { value: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.contactInfo.findMany({ where, orderBy: { [sortBy]: sortDir }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.contactInfo.count({ where }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Creates a new contact info record linked to the given user.
   *
   * @param userId - The owner's user ID
   * @param data - Contact info data
   * @returns The created contact info record
   */
  async create(userId: string, data: Omit<ContactInfo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ContactInfo> {
    await reorderOnSave('contactInfo', 'userId', userId, data.order ?? 0);
    return prisma.contactInfo.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  /**
   * Updates a contact info record scoped to the given user.
   *
   * @param id - The contact info ID
   * @param userId - The owner's user ID
   * @param data - Partial contact info data
   * @returns The updated record, or null if not found
   */
  async update(id: string, userId: string, data: Partial<ContactInfo>): Promise<ContactInfo | null> {
    const existing = await prisma.contactInfo.findFirst({ where: { id, userId } });
    if (!existing) {
      return null;
    }
    if (data.order !== undefined) {
      await reorderOnSave('contactInfo', 'userId', userId, data.order, id);
    }
    return prisma.contactInfo.update({ where: { id }, data });
  }

  /**
   * Deletes a contact info record scoped to the given user.
   *
   * @param id - The contact info ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.contactInfo.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.contactInfo.delete({ where: { id } });
    return true;
  }
}

