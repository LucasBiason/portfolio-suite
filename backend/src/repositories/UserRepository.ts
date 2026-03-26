/**
 * Data access layer for application users.
 */
import { prisma } from '../config/prisma';
import type { User } from '@prisma/client';

/**
 * Handles database access and creation for application users.
 */
export class UserRepository {
  /**
   * Finds a user by email address, including their profile.
   *
   * @param email - The user's email address
   * @returns The user with profile, or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  /**
   * Finds a user by ID, including their profile.
   *
   * @param id - The user's ID
   * @returns The user with profile, or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  /**
   * Creates a new user with a default empty profile.
   *
   * @param data - User registration data including email, password hash, display name and slug
   * @returns The newly created user
   */
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

