import { prisma } from '../config/prisma';
import type { User } from '@prisma/client';

/**
 * Repositório responsável por acessar e criar usuários da aplicação.
 */
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  async createUser(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    slug: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        profile: {
          create: {
            title: data.displayName,
            subtitle: 'Novo portfólio',
            bio: 'Atualize sua biografia.',
          },
        },
      },
    });
  }
}

