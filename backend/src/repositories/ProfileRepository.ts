import { prisma } from '../config/prisma';
import type { Profile } from '@prisma/client';

/**
 * Lida com operações do perfil do usuário dentro do Prisma.
 */
export class ProfileRepository {
  async getByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findUnique({ where: { userId } });
  }

  async update(userId: string, data: Partial<Profile>): Promise<Profile> {
    return prisma.profile.update({
      where: { userId },
      data,
    });
  }

  async getPublicProfileBySlug(slug: string): Promise<Profile | null> {
    return prisma.profile.findFirst({
      where: { user: { slug, active: true } },
      include: { user: true },
    });
  }
}

