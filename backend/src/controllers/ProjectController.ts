import type { Request, Response } from 'express';
import type { CreateProjectInput } from '../repositories/ProjectRepository';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { buildAssetUrl } from '../utils/assets';
import { createProjectSchema, updateProjectSchema } from '../schemas/projectSchemas';

/**
 * Responsible for exposing authenticated endpoints related to portfolio projects.
 */
export class ProjectController {
  private readonly projectRepository = new ProjectRepository();

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
      projects.map((project) => ({
        ...project,
        imageUrl: buildAssetUrl(project.imageUrl),
      })),
    );
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
    const projectData: CreateProjectInput = {
      ...payload,
      technologies: payload.technologies ?? [],
      featured: payload.featured ?? false,
      order: payload.order ?? 0,
    };
    const project = await this.projectRepository.create(req.userId, projectData);
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
    const updated = await this.projectRepository.update(req.params.id, req.userId, payload);
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

