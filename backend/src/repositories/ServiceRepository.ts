import { prisma } from '../config/prisma';
import type { Service } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

/**
 * Fornece operações CRUD para os serviços ofertados no portfólio.
 */
export class ServiceRepository {
  async listPublicByUser(userId: string): Promise<Service[]> {
    return prisma.service.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

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

  async create(userId: string, data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    await reorderOnSave('service', 'userId', userId, data.order ?? 0);
    return prisma.service.create({
      data: {
        ...data,
        userId,
      },
    });
  }

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

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.service.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.service.delete({ where: { id } });
    return true;
  }
}

