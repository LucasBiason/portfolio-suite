import { prisma } from '../config/prisma';
import type { ContactInfo } from '@prisma/client';

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

  async create(userId: string, data: Omit<ContactInfo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ContactInfo> {
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

