import { prisma } from '../config/prisma';
import type { Project } from '@prisma/client';

export type CreateProjectInput = {
  title: string;
  description: string;
  longDescription?: string | null;
  technologies?: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  imageUrl?: string | null;
  category: string;
  categoryLabel?: string | null;
  featured?: boolean;
  order?: number;
};

/**
 * Camada de acesso a dados responsável pelos projetos do portfólio.
 */
export class ProjectRepository {
  async listPublicByUser(userId: string, featured?: boolean): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        userId,
        ...(featured !== undefined ? { featured } : {}),
      },
      orderBy: { order: 'asc' },
    });
  }

  async listByUser(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async findById(id: string, userId: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, userId },
    });
  }

  async create(userId: string, data: CreateProjectInput): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        userId,
        technologies: data.technologies ?? [],
        featured: data.featured ?? false,
        order: data.order ?? 0,
      },
    });
  }

  async update(id: string, _userId: string, data: Partial<Project>): Promise<Project | null> {
    return prisma.project
      .update({
        where: { id },
        data,
      })
      .catch(() => null);
  }

  async delete(id: string, _userId: string): Promise<boolean> {
    return prisma.project
      .delete({
        where: { id },
      })
      .then(() => true)
      .catch(() => false);
  }
}

