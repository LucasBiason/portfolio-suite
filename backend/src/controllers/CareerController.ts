/**
 * Controller for career entry endpoints.
 * Provides public listing and authenticated admin CRUD operations.
 */
import type { Request, Response } from 'express';
import { CareerRepository } from '../repositories/CareerRepository';
import { createCareerSchema, updateCareerSchema } from '../schemas/careerSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Handles CRUD operations for career entries.
 * Provides public listing and authenticated admin endpoints.
 */
export class CareerController {
  private readonly careerRepository = new CareerRepository();

  /**
   * Lists career entries publicly (without authentication).
   * Uses default user email from environment to find user's career entries.
   */
  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.json([]);
      }

      const entries = await this.careerRepository.listPublicByUser(user.id);
      return res.json(entries);
    } catch (error: any) {
      console.error('Error in career listPublic:', error?.message || error);
      return res.json([]);
    }
  };

  /**
   * Lists career entries for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const entries = await this.careerRepository.listPublicByUser(req.userId);
    return res.json(entries);
  };

  /**
   * Lists career entries for the authenticated user with server-side filtering and pagination.
   */
  listAdmin = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const domainSlugs = typeof req.query.domains === 'string' && req.query.domains.length > 0
      ? req.query.domains.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined;
    const contractType = typeof req.query.contractType === 'string' ? req.query.contractType : undefined;
    const noStacks = req.query.noStacks === 'true';
    const noDomains = req.query.noDomains === 'true';
    const page = req.query.page !== undefined ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize !== undefined ? Number(req.query.pageSize) : 20;
    const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'order';
    const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

    const result = await this.careerRepository.listFiltered(req.userId, {
      search,
      domainSlugs,
      contractType: contractType || undefined,
      noStacks: noStacks || undefined,
      noDomains: noDomains || undefined,
      page,
      pageSize,
      sortBy,
      sortDir,
    });

    return res.json(result);
  };

  /**
   * Creates a new career entry linked to the authenticated user.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createCareerSchema.parse(req.body);
    const { stackIds, domainIds, startDate, endDate, ...rest } = payload;
    const entryData = {
      ...rest,
      contractType: rest.contractType ?? 'CLT',
      order: rest.order ?? 0,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    };
    const entry = await this.careerRepository.create(req.userId, entryData, stackIds, domainIds);
    return res.status(201).json(entry);
  };

  /**
   * Updates an existing career entry for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateCareerSchema.parse(req.body);
    const { stackIds, domainIds, startDate, endDate, ...rest } = payload;
    const entryData: Record<string, unknown> = { ...rest };
    if (startDate !== undefined) {
      entryData.startDate = new Date(startDate);
    }
    if (endDate !== undefined) {
      entryData.endDate = endDate ? new Date(endDate) : null;
    }
    const updated = await this.careerRepository.update(req.params.id, req.userId, entryData as any, stackIds, domainIds);
    if (!updated) {
      return res.status(404).json({ error: 'Career entry not found.' });
    }
    return res.json(updated);
  };

  /**
   * Removes a career entry belonging to the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const deleted = await this.careerRepository.delete(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Career entry not found.' });
    }
    return res.status(204).send();
  };
}
