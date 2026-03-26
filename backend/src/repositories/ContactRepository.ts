import { prisma } from '../config/prisma';
import type { ContactInfo } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

/**
 * Centraliza o acesso aos registros de contato (cards e redes sociais).
 */
export class ContactRepository {
  async listPublicByUser(userId: string): Promise<ContactInfo[]> {
    return prisma.contactInfo.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

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

  async create(userId: string, data: Omit<ContactInfo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ContactInfo> {
    await reorderOnSave('contactInfo', 'userId', userId, data.order ?? 0);
    return prisma.contactInfo.create({
      data: {
        ...data,
        userId,
      },
    });
  }

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

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.contactInfo.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.contactInfo.delete({ where: { id } });
    return true;
  }
}

