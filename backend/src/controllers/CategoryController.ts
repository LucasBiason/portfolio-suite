import type { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/CategoryRepository';
import { createCategorySchema, updateCategorySchema } from '../schemas/categorySchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Controls endpoints for portfolio categories.
 */
export class CategoryController {
  private readonly categoryRepository = new CategoryRepository();

  /**
   * Lists categories publicly (without authentication).
   * Uses default user email from environment to find user's categories.
   */
  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.json([]);
      }

      const categories = await this.categoryRepository.listByUser(user.id);
      return res.json(categories);
    } catch (error: any) {
      console.error('Error in listPublic:', error?.message || error);
      return res.json([]);
    }
  };

  /**
   * Lists categories for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const categories = await this.categoryRepository.listByUser(req.userId);
    return res.json(categories);
  };

  /**
   * Creates a new category linked to the authenticated user.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createCategorySchema.parse(req.body);
    const category = await this.categoryRepository.create(req.userId, payload);
    return res.status(201).json(category);
  };

  /**
   * Updates an existing category for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateCategorySchema.parse(req.body);
    const updated = await this.categoryRepository.update(req.params.id, req.userId, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json(updated);
  };

  /**
   * Removes a category as long as it belongs to the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const deleted = await this.categoryRepository.delete(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.status(204).send();
  };
}
