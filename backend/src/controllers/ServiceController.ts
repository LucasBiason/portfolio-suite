import type { Service } from '@prisma/client';
import type { Request, Response } from 'express';
import { ServiceRepository } from '../repositories/ServiceRepository';
import { createServiceSchema, updateServiceSchema } from '../schemas/serviceSchemas';

/**
 * Manages specialties/services exposed in the portfolio.
 */
export class ServiceController {
  private readonly serviceRepository = new ServiceRepository();

  /**
   * Lists services for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const services = await this.serviceRepository.listPublicByUser(req.userId);
    return res.json(services);
  };

  /**
   * Registers a new service.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createServiceSchema.parse(req.body);
    const serviceData: Omit<Service, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      ...payload,
      order: payload.order ?? 0,
      icon: payload.icon ?? null,
    };
    const service = await this.serviceRepository.create(req.userId, serviceData);
    return res.status(201).json(service);
  };

  /**
   * Updates an existing service belonging to the user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateServiceSchema.parse(req.body);
    const updated = await this.serviceRepository.update(req.params.id, req.userId, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.json(updated);
  };

  /**
   * Removes the specified service.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const deleted = await this.serviceRepository.delete(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.status(204).send();
  };
}

