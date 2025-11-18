import { prisma } from '../config/prisma';
import type { Service } from '@prisma/client';

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

  async create(userId: string, data: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Service> {
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

