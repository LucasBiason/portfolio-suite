import type { Request, Response } from 'express';
import type { ContactInfo as ContactInfoModel } from '@prisma/client';
import { ContactRepository } from '../repositories/ContactRepository';
import { createContactSchema, updateContactSchema } from '../schemas/contactSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Exposes authenticated operations to manage portfolio contact channels.
 */
export class ContactController {
  private readonly contactRepository = new ContactRepository();

  /**
   * Builds contact payload combining profile (titles) and registered cards.
   */
  private async buildContactPayload(userId: string, options?: { includeIds?: boolean }) {
    const [profile, contacts] = await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      this.contactRepository.listPublicByUser(userId),
    ]);

    return {
      title: profile?.contactTitle ?? 'Vamos conversar',
      subtitle: profile?.contactSubtitle ?? 'Precisa de ajuda com APIs, automação de processos ou integrações?',
      description: profile?.contactDescription ?? 'Fale um pouco sobre o contexto do projeto e como posso somar. Respondo com clareza sobre prazos, escopo e os próximos passos possíveis.',
      info: contacts.length
        ? contacts.map((item: ContactInfoModel) =>
            options?.includeIds
              ? item
              : {
                  icon: item.icon ?? 'bx-link',
                  title: item.title,
                  value: item.value,
                  href: item.href,
                },
          )
        : [],
    };
  }

  /**
   * Returns contact section content publicly (without authentication).
   * Uses default user email from environment to find user's contact info.
   */
  listPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.json({
          title: 'Vamos conversar',
          subtitle: 'Precisa de ajuda com APIs, automação de processos ou integrações?',
          description: 'Fale um pouco sobre o contexto do projeto e como posso somar. Respondo com clareza sobre prazos, escopo e os próximos passos possíveis.',
          info: [],
        });
      }

      const payload = await this.buildContactPayload(user.id, { includeIds: false });
      return res.json(payload);
    } catch (error: any) {
      console.error('Error in listPublic:', error?.message || error);
      return res.json({
        title: 'Vamos conversar',
        subtitle: 'Precisa de ajuda com APIs, automação de processos ou integrações?',
        description: 'Fale um pouco sobre o contexto do projeto e como posso somar. Respondo com clareza sobre prazos, escopo e os próximos passos possíveis.',
        info: [],
      });
    }
  };

  /**
   * Returns contact section content for the authenticated user.
   */
  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = await this.buildContactPayload(req.userId, { includeIds: true });
    return res.json(payload);
  };

  /**
   * Creates a new contact card linked to the authenticated user.
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = createContactSchema.parse(req.body);
    const contactData: Omit<ContactInfoModel, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      ...payload,
      order: payload.order ?? 0,
      href: payload.href ?? null,
      icon: payload.icon ?? null,
      type: payload.type ?? null,
    };
    const contact = await this.contactRepository.create(req.userId, contactData);
    return res.status(201).json(contact);
  };

  /**
   * Updates an existing contact card for the authenticated user.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateContactSchema.parse(req.body);
    const updated = await this.contactRepository.update(req.params.id, req.userId, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    return res.json(updated);
  };

  /**
   * Removes a contact card belonging to the authenticated user.
   */
  delete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const deleted = await this.contactRepository.delete(req.params.id, req.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    return res.status(204).send();
  };
}

