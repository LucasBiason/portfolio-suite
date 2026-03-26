/**
 * Data access layer for career entries.
 * Handles listing, filtering, creation, update and deletion with stack and domain relations.
 */
import { prisma } from '../config/prisma';
import type { CareerEntry } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

type CareerEntryData = Omit<CareerEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

const includeStacks = {
  stacks: {
    include: { stackDetail: true },
    orderBy: { stackDetail: { name: 'asc' as const } },
  },
  domains: {
    include: { domain: true },
    orderBy: { domain: { name: 'asc' as const } },
  },
};

/**
 * Data access layer for career entries.
 */
export class CareerRepository {
  /**
   * Lists all career entries for a user ordered by position.
   *
   * @param userId - The owner's user ID
   * @returns Array of career entries with stacks and domains
   */
  async listPublicByUser(userId: string) {
    return prisma.careerEntry.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: includeStacks,
    });
  }

  /**
   * Lists career entries with server-side filtering, sorting and pagination.
   *
   * @param userId - The owner's user ID
   * @param opts - Filter, sort and pagination options
   * @returns Paginated result with data, total count and page metadata
   */
  async listFiltered(userId: string, opts: {
    search?: string;
    domainSlugs?: string[];
    contractType?: string;
    noStacks?: boolean;
    noDomains?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { search, domainSlugs, contractType, noStacks, noDomains, page = 1, pageSize = 20, sortBy = 'order', sortDir = 'asc' } = opts;
    const where: Record<string, unknown> = { userId };

    if (contractType) where.contractType = contractType;
    if (noStacks) where.stacks = { none: {} };
    if (noDomains) where.domains = { none: {} };

    if (domainSlugs?.length) {
      where.domains = {
        some: {
          domain: { slug: { in: domainSlugs } },
        },
      };
    }

    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.careerEntry.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: includeStacks,
      }),
      prisma.careerEntry.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  /**
   * Creates a new career entry with optional stack and domain associations.
   *
   * @param userId - The owner's user ID
   * @param data - Career entry data
   * @param stackIds - Stack IDs to associate
   * @param domainIds - Domain IDs to associate
   * @returns The created entry with all relations
   */
  async create(userId: string, data: CareerEntryData, stackIds: string[] = [], domainIds: string[] = []) {
    await reorderOnSave('careerEntry', 'userId', userId, data.order ?? 0);
    return prisma.careerEntry.create({
      data: {
        ...data,
        userId,
        ...(stackIds.length ? {
          stacks: {
            create: stackIds.map((stackDetailId) => ({ stackDetailId })),
          },
        } : {}),
        ...(domainIds.length ? {
          domains: {
            create: domainIds.map((domainId) => ({ domainId })),
          },
        } : {}),
      },
      include: includeStacks,
    });
  }

  /**
   * Updates a career entry, replacing stacks and domains when provided.
   *
   * @param id - The career entry ID
   * @param userId - The owner's user ID
   * @param data - Partial career entry data
   * @param stackIds - If provided, replaces all existing stack associations
   * @param domainIds - If provided, replaces all existing domain associations
   * @returns The updated entry, or null if not found
   */
  async update(id: string, userId: string, data: Partial<CareerEntryData>, stackIds?: string[], domainIds?: string[]) {
    const existing = await prisma.careerEntry.findFirst({ where: { id, userId } });
    if (!existing) return null;
    if (data.order !== undefined) {
      await reorderOnSave('careerEntry', 'userId', userId, data.order, id);
    }
    if (stackIds !== undefined) {
      await prisma.careerStack.deleteMany({ where: { careerEntryId: id } });
    }

    if (domainIds !== undefined) {
      await prisma.careerDomain.deleteMany({ where: { careerEntryId: id } });
    }

    return prisma.careerEntry.update({
      where: { id },
      data: {
        ...data,
        ...(stackIds !== undefined ? {
          stacks: {
            create: stackIds.map((stackDetailId) => ({ stackDetailId })),
          },
        } : {}),
        ...(domainIds !== undefined ? {
          domains: {
            create: domainIds.map((domainId) => ({ domainId })),
          },
        } : {}),
      },
      include: includeStacks,
    });
  }

  /**
   * Deletes a career entry scoped to the given user.
   *
   * @param id - The career entry ID
   * @param userId - The owner's user ID
   * @returns True if deleted, false if not found
   */
  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.careerEntry.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.careerEntry.delete({ where: { id } });
    return true;
  }
}
