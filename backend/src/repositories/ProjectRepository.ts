/**
 * Data access layer for portfolio projects.
 */
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
 * Data access layer for portfolio projects.
 * Handles listing, filtering, creation, update and deletion with image and relation support.
 */
export class ProjectRepository {
  /**
   * Lists all published projects for a user, optionally filtered by featured status.
   *
   * @param userId - The owner's user ID
   * @param featured - Optional filter for featured projects
   * @returns Array of projects with images, categories and stacks
   */
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

  /**
   * Lists all projects for a user regardless of featured status.
   *
   * @param userId - The owner's user ID
   * @returns Array of projects ordered by position
   */
  async listByUser(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
      include: includeRelations,
    });
  }

  /**
   * Lists projects with server-side filtering, sorting and pagination.
   *
   * @param userId - The owner's user ID
   * @param opts - Filter, sort and pagination options
   * @returns Paginated result with data, total count and page metadata
   */
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

  /**
   * Finds a single project by ID scoped to the given user.
   *
   * @param id - The project ID
   * @param userId - The owner's user ID
   * @returns The project with relations, or null if not found
   */
  async findById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: { id, userId },
      include: includeRelations,
    });
  }

  /**
   * Creates a new project with optional images, categories and stacks.
   *
   * @param userId - The owner's user ID
   * @param data - Project data including optional relation IDs
   * @param images - Optional array of images to attach
   * @returns The created project with all relations
   */
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

  /**
   * Updates a project, replacing images/categories/stacks when provided.
   *
   * @param id - The project ID
   * @param _userId - The owner's user ID (used for reorder)
   * @param data - Partial project data with optional relation ID arrays
   * @param images - If provided, replaces all existing images
   * @returns The updated project, or null if not found
   */
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

  /**
   * Deletes a project by ID.
   *
   * @param id - The project ID
   * @param _userId - The owner's user ID (unused but kept for consistency)
   * @returns True if deleted, false if not found
   */
  async delete(id: string, _userId: string): Promise<boolean> {
    return prisma.project
      .delete({ where: { id } })
      .then(() => true)
      .catch(() => false);
  }
}
