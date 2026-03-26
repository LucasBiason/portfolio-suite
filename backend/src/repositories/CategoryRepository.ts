/**
 * Data access layer for portfolio categories.
 */
import { prisma } from '../config/prisma';
import type { Category } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

const toSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export type CreateCategoryInput = {
  name: string;
  slug?: string;
  icon?: string;
  color?: string;
  order?: number;
};

export class CategoryRepository {
  /**
   * Lists all categories for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of categories
   */
  async listByUser(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Creates a new category linked to the given user.
   * Auto-generates a slug from the name when not provided.
   *
   * @param userId - The owner's user ID
   * @param data - Category data
   * @returns The created category
   */
  async create(userId: string, data: CreateCategoryInput): Promise<Category> {
    const slug = data.slug ?? toSlug(data.name);
    await reorderOnSave('category', 'userId', userId, data.order ?? 0);
    return prisma.category.create({
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
   * Updates a category scoped to the given user.
   * Auto-generates a new slug when the name changes without an explicit slug.
   *
   * @param id - The category ID
   * @param userId - The owner's user ID
   * @param data - Partial category data
   * @returns The updated category, or null if not found
   */
  async update(id: string, userId: string, data: Partial<CreateCategoryInput>): Promise<Category | null> {
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      return null;
    }
    if (data.order !== undefined) {
      await reorderOnSave('category', 'userId', userId, data.order, id);
    }
    const updateData: Partial<Category> = { ...data } as Partial<Category>;
    if (data.name && !data.slug) {
      updateData.slug = toSlug(data.name);
    }

    return prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Deletes a category scoped to the given user.
   *
   * @param id - The category ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      return false;
    }
    await prisma.category.delete({ where: { id } });
    return true;
  }
}
