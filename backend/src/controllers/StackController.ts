import type { Request, Response } from 'express';
import { StackRepository } from '../repositories/StackRepository';
import { createStackSchema, updateStackSchema } from '../schemas/stackSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

export class StackController {
  private readonly stackRepository = new StackRepository();

  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });
      if (!user) return res.json([]);
      const stacks = await this.stackRepository.listPublicByUser(user.id);
      return res.json(stacks);
    } catch (error: any) {
      console.error('Error in stack listPublic:', error?.message || error);
      return res.json([]);
    }
  };

  listAdmin = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const categoryFilter = typeof req.query.category === 'string' ? req.query.category : undefined;
    const levelFilter = typeof req.query.level === 'string' ? req.query.level : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'order';
    const sortDir = req.query.sortDir === 'desc' ? 'desc' as const : 'asc' as const;
    const result = await this.stackRepository.listFiltered(req.userId, { search, categoryFilter, levelFilter, page, pageSize, sortBy, sortDir });
    return res.json(result);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const stacks = await this.stackRepository.listPublicByUser(req.userId);
    return res.json(stacks);
  };

  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const payload = createStackSchema.parse(req.body);
    const stack = await this.stackRepository.create(req.userId, {
      ...payload,
      endYear: payload.endYear ?? null,
      order: payload.order ?? 0,
      icon: payload.icon ?? null,
    });
    return res.status(201).json(stack);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const payload = updateStackSchema.parse(req.body);
    const updated = await this.stackRepository.update(req.params.id, req.userId, payload);
    if (!updated) return res.status(404).json({ error: 'Stack not found.' });
    return res.json(updated);
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const deleted = await this.stackRepository.delete(req.params.id, req.userId);
    if (!deleted) return res.status(404).json({ error: 'Stack not found.' });
    return res.status(204).send();
  };
}
