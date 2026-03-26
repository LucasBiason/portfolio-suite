import { prisma } from '../config/prisma';

export class SettingsRepository {
  async getByUser(userId: string) {
    return prisma.siteSettings.findUnique({ where: { userId } });
  }

  async getByUserPublic(userId: string) {
    return prisma.siteSettings.findUnique({ where: { userId } });
  }

  async upsert(userId: string, data: Record<string, string>) {
    return prisma.siteSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
