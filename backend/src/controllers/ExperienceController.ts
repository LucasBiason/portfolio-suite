import type { Experience } from '@prisma/client';
import type { Request, Response } from 'express';
import { ExperienceRepository } from '../repositories/ExperienceRepository';
import { createExperienceSchema, updateExperienceSchema } from '../schemas/experienceSchemas';

/**
 * Controls authenticated endpoints for the experience timeline.
 */
export class ExperienceController {
  private readonly experienceRepository = new ExperienceRepository();

  /**
   * Lists experiences for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const experiences = await this.experienceRepository.listPublicByUser(req.userId);
    return res.json(experiences);
  };

  /**
   * Creates a new professional experience record.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createExperienceSchema.parse(req.body);
    const experienceData: Omit<Experience, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      ...payload,
      order: payload.order ?? 0,
    };
    const experience = await this.experienceRepository.create(req.userId, experienceData);
    return res.status(201).json(experience);
  };

  /**
   * Updates the requested experience for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateExperienceSchema.parse(req.body);
    const updated = await this.experienceRepository.update(req.params.id, req.userId, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Experience not found.' });
    }
    return res.json(updated);
  };

  /**
   * Removes the requested experience as long as it belongs to the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const deleted = await this.experienceRepository.delete(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Experience not found.' });
    }
    return res.status(204).send();
  };
}

