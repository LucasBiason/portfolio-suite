import type { Request, Response } from 'express';
import { DomainRepository } from '../repositories/DomainRepository';
import { createDomainSchema, updateDomainSchema } from '../schemas/domainSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Controls endpoints for portfolio domains.
 */
export class DomainController {
  private readonly domainRepository = new DomainRepository();

  /**
   * Lists domains publicly (without authentication).
   * Uses default user email from environment to find user's domains.
   */
  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.json([]);
      }

      const domains = await this.domainRepository.listByUser(user.id);
      return res.json(domains);
    } catch (error: any) {
      console.error('Error in listPublic:', error?.message || error);
      return res.json([]);
    }
  };

  /**
   * Lists domains for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const domains = await this.domainRepository.listByUser(req.userId);
    return res.json(domains);
  };

  /**
   * Creates a new domain linked to the authenticated user.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createDomainSchema.parse(req.body);
    const domain = await this.domainRepository.create(req.userId, payload);
    return res.status(201).json(domain);
  };

  /**
   * Updates an existing domain for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateDomainSchema.parse(req.body);
    const updated = await this.domainRepository.update(req.params.id, req.userId, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Domain not found.' });
    }
    return res.json(updated);
  };

  /**
   * Removes a domain as long as it belongs to the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const deleted = await this.domainRepository.delete(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Domain not found.' });
    }
    return res.status(204).send();
  };
}
