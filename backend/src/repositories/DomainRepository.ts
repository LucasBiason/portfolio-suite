/**
 * Data access layer for portfolio domains.
 */
import { prisma } from '../config/prisma';
import type { Domain } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export type CreateDomainInput = {
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  order?: number;
};

export class DomainRepository {
  /**
   * Lists all domains for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of domains
   */
  async listByUser(userId: string): Promise<Domain[]> {
    return prisma.domain.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Creates a new domain linked to the given user.
   * Auto-generates a slug from the name when not provided.
   *
   * @param userId - The owner's user ID
   * @param data - Domain data
   * @returns The created domain
   */
  async create(userId: string, data: CreateDomainInput): Promise<Domain> {
    const slug = data.slug ?? toSlug(data.name);
    await reorderOnSave('domain', 'userId', userId, data.order ?? 0);
    return prisma.domain.create({
      data: {
        name: data.name,
        slug,
        icon: data.icon ?? null,
        color: data.color ?? null,
        order: data.order ?? 0,
        userId,
      },
    });
  }

  /**
   * Updates a domain scoped to the given user.
   * Auto-generates a new slug when the name changes without an explicit slug.
   *
   * @param id - The domain ID
   * @param userId - The owner's user ID
   * @param data - Partial domain data
   * @returns The updated domain, or null if not found
   */
  async update(id: string, userId: string, data: Partial<CreateDomainInput>): Promise<Domain | null> {
    const existing = await prisma.domain.findFirst({ where: { id, userId } });
    if (!existing) {
      return null;
    }
    if (data.order !== undefined) {
      await reorderOnSave('domain', 'userId', userId, data.order, id);
    }
    const updateData: Partial<Domain> = { ...data } as Partial<Domain>;
    if (data.name && !data.slug) {
      updateData.slug = toSlug(data.name);
    }

    return prisma.domain.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletes a domain scoped to the given user.
   *
   * @param id - The domain ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.domain.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.domain.delete({ where: { id } });
    return true;
  }
}
