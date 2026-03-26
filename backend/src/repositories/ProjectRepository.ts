import { prisma } from '../config/prisma';
import type { Project } from '@prisma/client';
import { reorderOnSave } from '../utils/reorder';

export type CreateProjectInput = {
  title: string;
  description: string;
  longDescription?: string | null;
  technologies?: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
  category?: string;
  categoryLabel?: string | null;
  featured?: boolean;
  order?: number;
  categoryIds?: string[];
  stackIds?: string[];
};

type ImageInput = {
  url: string;
  alt?: string;
  order?: number;
};

const includeRelations = {
  images: {
    orderBy: { order: 'asc' as const },
  },
  categories: {
    include: { category: true },
    orderBy: { category: { name: 'asc' as const } },
  },
  stacks: {
    include: { stackDetail: true },
    orderBy: { stackDetail: { name: 'asc' as const } },
  },
};

/**
 * Camada de acesso a dados responsavel pelos projetos do portfolio.
 */
export class ProjectRepository {
  async listPublicByUser(userId: string, featured?: boolean) {
    return prisma.project.findMany({
      where: {
        userId,
        ...(featured !== undefined ? { featured } : {}),
      },
      orderBy: { order: 'asc' },
      include: includeRelations,
    });
  }

  async listByUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: includeRelations,
    });
  }

  async listFiltered(userId: string, opts: {
    search?: string;
    categorySlugs?: string[];
    stackNames?: string[];
    featured?: boolean;
    noGithub?: boolean;
    noImages?: boolean;
    noStacks?: boolean;
    noCategories?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) {
    const { search, categorySlugs, stackNames, featured, noGithub, noImages, noStacks, noCategories, page = 1, pageSize = 20, sortBy = 'order', sortDir = 'asc' } = opts;

    const where: Record<string, unknown> = { userId };

    if (featured !== undefined) where.featured = featured;

    if (noGithub) {
      where.OR = [{ githubUrl: null }, { githubUrl: '' }];
    }

    if (noImages) {
      where.images = { none: {} };
    }

    if (noStacks) {
      where.stacks = { none: {} };
    }

    if (noCategories) {
      where.categories = { none: {} };
    }

    if (search) {
      // If OR already set by noGithub, wrap in AND
      const searchCondition = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR as unknown[] }, { OR: searchCondition }];
        delete where.OR;
      } else {
        where.OR = searchCondition;
      }
    }

    if (categorySlugs?.length) {
      where.categories = {
        some: {
          category: {
            slug: { in: categorySlugs },
          },
        },
      };
    }

    if (stackNames?.length) {
      where.stacks = {
        some: {
          stackDetail: {
            name: { in: stackNames },
          },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: includeRelations,
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: { id, userId },
      include: includeRelations,
    });
  }

  async create(userId: string, data: CreateProjectInput, images?: ImageInput[]) {
    const { categoryIds, stackIds, ...projectData } = data;
    await reorderOnSave('project', 'userId', userId, projectData.order ?? 0);
    return prisma.project.create({
      data: {
        ...projectData,
        userId,
        technologies: projectData.technologies ?? [],
        featured: projectData.featured ?? false,
        order: projectData.order ?? 0,
        ...(images?.length ? {
          images: {
            create: images.map((img, i) => ({
              url: img.url,
              alt: img.alt ?? null,
              order: img.order ?? i,
            })),
          },
        } : {}),
        ...(categoryIds?.length ? {
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        } : {}),
        ...(stackIds?.length ? {
          stacks: {
            create: stackIds.map((stackDetailId) => ({ stackDetailId })),
          },
        } : {}),
      },
      include: includeRelations,
    });
  }

  async update(id: string, _userId: string, data: Partial<Project> & { categoryIds?: string[]; stackIds?: string[] }, images?: ImageInput[]) {
    const { categoryIds, stackIds, ...projectData } = data as CreateProjectInput & Partial<Project>;
    if (projectData.order !== undefined) {
      await reorderOnSave('project', 'userId', _userId, projectData.order, id);
    }
    if (images !== undefined) {
      await prisma.projectImage.deleteMany({ where: { projectId: id } });
    }

    if (categoryIds !== undefined) {
      await prisma.projectCategory.deleteMany({ where: { projectId: id } });
    }

    if (stackIds !== undefined) {
      await prisma.projectStack.deleteMany({ where: { projectId: id } });
    }

    return prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        ...(images !== undefined ? {
          images: {
            create: images.map((img, i) => ({
              url: img.url,
              alt: img.alt ?? null,
              order: img.order ?? i,
            })),
          },
        } : {}),
        ...(categoryIds !== undefined ? {
          categories: {
            create: categoryIds.map((categoryId) => ({ categoryId })),
          },
        } : {}),
        ...(stackIds !== undefined ? {
          stacks: {
            create: stackIds.map((stackDetailId) => ({ stackDetailId })),
          },
        } : {}),
      },
      include: includeRelations,
    }).catch(() => null);
  }

  async delete(id: string, _userId: string): Promise<boolean> {
    return prisma.project
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);
  }
}
