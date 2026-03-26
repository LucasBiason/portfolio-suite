import type { Request, Response } from 'express';
import type { CreateProjectInput } from '../repositories/ProjectRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { buildAssetUrl } from '../utils/assets';
import { createProjectSchema, updateProjectSchema } from '../schemas/projectSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';
// Types are automatically loaded from src/types/express.d.ts

/**
 * Responsible for exposing authenticated endpoints related to portfolio projects.
 */
export class ProjectController {
  private readonly projectRepository = new ProjectRepository();

  /**
   * Lists projects publicly (without authentication).
   * Uses default user email from environment to find user's projects.
   */
  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Find user by default email
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        // Return empty array if user doesn't exist (no projects yet)
        return res.json([]);
      }

      const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;
      const projects = await this.projectRepository.listPublicByUser(user.id, featured);
      
      return res.json(
        projects.map((project) => {
          let imageUrl: string | string[] | null = project.imageUrl;
          
          // Try to parse as JSON array, fallback to string
          if (imageUrl) {
            try {
              const parsed = JSON.parse(imageUrl);
              if (Array.isArray(parsed)) {
                imageUrl = parsed.map((url: string) => buildAssetUrl(url) ?? url);
              } else {
                imageUrl = buildAssetUrl(imageUrl as string) ?? null;
              }
            } catch {
              // Not JSON, treat as single image URL
              imageUrl = buildAssetUrl(imageUrl as string) ?? null;
            }
          }
          
          return {
            ...project,
            imageUrl,
          };
        }),
      );
    } catch (error: any) {
      console.error('Error in listPublic:', error?.message || error);
      // Return empty array on error instead of 500, so frontend can still load
      return res.json([]);
    }
  };

  /**
   * Lists projects for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const featured = req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    const projects = await this.projectRepository.listPublicByUser(req.userId, featured);
    return res.json(
      projects.map((project) => {
        let imageUrl: string | string[] | null = project.imageUrl;
        
        // Try to parse as JSON array, fallback to string
        if (imageUrl) {
          try {
            const parsed = JSON.parse(imageUrl);
            if (Array.isArray(parsed)) {
              imageUrl = parsed.map((url: string) => buildAssetUrl(url) ?? url);
            } else {
              imageUrl = buildAssetUrl(imageUrl as string) ?? null;
            }
          } catch {
            // Not JSON, treat as single image URL
            imageUrl = buildAssetUrl(imageUrl as string) ?? null;
          }
        }
        
        return {
          ...project,
          imageUrl,
        };
      }),
    );
  };

  /**
   * Lists projects for the authenticated user with server-side filtering and pagination.
   */
  listAdmin = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const categorySlugs =
      typeof req.query.categories === 'string' && req.query.categories.length > 0
        ? req.query.categories.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

    const featured =
      req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined;

    const page = req.query.page !== undefined ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize !== undefined ? Number(req.query.pageSize) : 20;

    const stackNames =
      typeof req.query.stacks === 'string' && req.query.stacks.length > 0
        ? req.query.stacks.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

    const noGithub = req.query.noGithub === 'true';
    const noImages = req.query.noImages === 'true';
    const noStacks = req.query.noStacks === 'true';
    const noCategories = req.query.noCategories === 'true';

    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'order';
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    // Prisma can't sort by many-to-many relation names, handle in memory
    const actualSortBy = (sortBy === 'categories' || sortBy === 'stacks') ? 'order' : sortBy;

    const result = await this.projectRepository.listFiltered(req.userId, {
      search,
      categorySlugs,
      stackNames,
      featured,
      noGithub: noGithub || undefined,
      noImages: noImages || undefined,
      noStacks: noStacks || undefined,
      noCategories: noCategories || undefined,
      page,
      pageSize,
      sortBy: actualSortBy,
      sortDir,
    });

    if (sortBy === 'categories') {
      const getCatText = (p: { categories?: { category: { name: string } }[] }) =>
        (p.categories ?? []).map((c) => c.category.name).sort().join(', ');
      result.data.sort((a, b) => {
        const cmp = getCatText(a).localeCompare(getCatText(b), 'pt-BR');
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    if (sortBy === 'stacks') {
      const getStackText = (p: { stacks?: { stackDetail: { name: string } }[] }) =>
        (p.stacks ?? []).map((s) => s.stackDetail.name).sort().join(', ');
      result.data.sort((a, b) => {
        const cmp = getStackText(a).localeCompare(getStackText(b), 'pt-BR');
        return sortDir === 'desc' ? -cmp : cmp;
      });
    }

    return res.json(result);
  };

  /**
   * Returns projects for the authenticated user for editing.
   */
  listMine = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const projects = await this.projectRepository.listByUser(req.userId);
    return res.json(projects);
  };

  /**
   * Registers a new project linked to the authenticated user.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createProjectSchema.parse(req.body);
    const { images, categoryIds, stackIds, ...rest } = payload;
    const projectData: CreateProjectInput = {
      ...rest,
      githubUrl: rest.githubUrl || null,
      demoUrl: rest.demoUrl || null,
      technologies: rest.technologies ?? [],
      featured: rest.featured ?? false,
      order: rest.order ?? 0,
      categoryIds,
      stackIds,
    };
    const project = await this.projectRepository.create(req.userId, projectData, images);
    return res.status(201).json(project);
  };

  /**
   * Updates an existing project for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateProjectSchema.parse(req.body);
    const existing = await this.projectRepository.findById(req.params.id, req.userId);
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    const { images, categoryIds, stackIds, ...rest } = payload;
    if (rest.githubUrl === '') rest.githubUrl = undefined;
    if (rest.demoUrl === '') rest.demoUrl = undefined;
    const updated = await this.projectRepository.update(req.params.id, req.userId, { ...rest, categoryIds, stackIds }, images);
    return res.json(updated);
  };

  /**
   * Removes a project from the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const existing = await this.projectRepository.findById(req.params.id, req.userId);
    if (!existing || existing.userId !== req.userId) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    await this.projectRepository.delete(req.params.id, req.userId);
    return res.status(204).send();
  };
}

