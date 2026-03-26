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

export class CareerRepository {
  async listPublicByUser(userId: string) {
    return prisma.careerEntry.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: includeStacks,
    });
  }

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

  async delete(id: string, userId: string): Promise<boolean> {
    const existing = await prisma.careerEntry.findFirst({ where: { id, userId } });
    if (!existing) return false;
    await prisma.careerEntry.delete({ where: { id } });
    return true;
  }
}
