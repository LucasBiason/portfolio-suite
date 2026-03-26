/**
 * Controller for education record endpoints.
 * Provides public listing and authenticated admin CRUD operations.
 */
import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(2),
  institution: z.string().min(2),
  period: z.string().min(2),
  description: z.string().optional(),
  status: z.string().optional(),
  tags: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

const updateSchema = createSchema.partial();

/**
 * Handles CRUD operations for education records.
 * Provides public listing and authenticated admin endpoints.
 */
export class EducationController {
  /**
   * Lists education records publicly without authentication.
   * Uses the default user email from environment to find records.
   */
  listPublic = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({ where: { email: appEnv.defaultEmail } });
      if (!user) return res.json([]);
      const data = await prisma.education.findMany({ where: { userId: user.id }, orderBy: { order: 'asc' } });
      return res.json(data);
    } catch {
      return res.json([]);
    }
  };

  /**
   * Lists education records for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const data = await prisma.education.findMany({ where: { userId: req.userId }, orderBy: { order: 'asc' } });
    return res.json(data);
  };

  /**
   * Creates a new education record linked to the authenticated user.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const payload = createSchema.parse(req.body);
    const data = await prisma.education.create({
      data: { ...payload, tags: payload.tags ?? [], order: payload.order ?? 0, status: payload.status ?? 'completed', userId: req.userId },
    });
    return res.status(201).json(data);
  };

  /**
   * Updates an existing education record for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const payload = updateSchema.parse(req.body);
    const existing = await prisma.education.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Not found.' });
    const data = await prisma.education.update({ where: { id: req.params.id }, data: payload });
    return res.json(data);
  };

  /**
   * Removes an education record belonging to the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const existing = await prisma.education.findFirst({ where: { id: req.params.id, userId: req.userId } });
    if (!existing) return res.status(404).json({ error: 'Not found.' });
    await prisma.education.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  };
}
