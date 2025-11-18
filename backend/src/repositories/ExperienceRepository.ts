import { prisma } from '../config/prisma';
import type { Experience } from '@prisma/client';

/**
 * Abstrai o acesso às experiências profissionais no banco.
 */
export class ExperienceRepository {
  async listPublicByUser(userId: string): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async create(userId: string, data: Omit<Experience, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Experience> {
    return prisma.experience.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: string, userId: string, data: Partial<Experience>): Promise<Experience | null> {
    const existing = await prisma.experience.findFirst({ where: { id, userId } });
    if (!existing) {
      return null;
    }
    return prisma.experience.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.experience.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.experience.delete({ where: { id } });
    return true;
  }
}

