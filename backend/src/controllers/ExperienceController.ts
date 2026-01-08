import type { Experience } from '@prisma/client';
import type { Request, Response } from 'express';
import { ExperienceRepository } from '../repositories/ExperienceRepository';
import { createExperienceSchema, updateExperienceSchema } from '../schemas/experienceSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Controls authenticated endpoints for the experience timeline.
 */
export class ExperienceController {
  private readonly experienceRepository = new ExperienceRepository();

  /**
   * Lists experiences publicly (without authentication).
   * Uses default user email from environment to find user's experiences.
   */
  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.json([]);
      }

      const experiences = await this.experienceRepository.listPublicByUser(user.id);
      return res.json(experiences);
    } catch (error: any) {
      console.error('Error in listPublic:', error?.message || error);
      return res.json([]);
    }
  };

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

