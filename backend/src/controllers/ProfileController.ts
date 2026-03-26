import type { Request, Response } from 'express';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { ContactRepository } from '../repositories/ContactRepository';
import { buildAssetUrl } from '../utils/assets';
import { updateProfileSchema } from '../schemas/profileSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Controls the exposure of public profile and editing panel for the authenticated user.
 */
export class ProfileController {
  private readonly profileRepository = new ProfileRepository();
  private readonly contactRepository = new ContactRepository();

  /**
   * Builds the complete profile payload (hero, SEO, sections and footer) from the database.
   */
  private async buildProfileResponse(userId: string) {
    const profile = await this.profileRepository.getByUserId(userId);
    if (!profile) {
      throw new Error('Profile not found.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    const contacts = await this.contactRepository.listPublicByUser(userId);
    const socialLinks = contacts
      .filter((contact) => contact.type === 'social')
      .map((contact) => ({
        icon: contact.icon ?? 'bx-link',
        url: contact.href ?? contact.value,
        label: contact.title,
      }));

    return {
      name: user.displayName,
      email: user.email,
      title: profile.title,
      subtitle: profile.subtitle,
      bio: profile.bio,
      highlights: profile.highlights,
      avatarUrl: buildAssetUrl(profile.avatarUrl),
      heroBackgroundUrl: buildAssetUrl(profile.heroBackgroundUrl),
      socialLinks,
      seo: {
        title: profile.seoTitle,
        description: profile.seoDescription,
      },
      sections: {
        projects: {
          title: profile.sectionProjectsTitle,
          subtitle: profile.sectionProjectsSubtitle,
        },
      },
      contact: {
        title: profile.contactTitle,
        subtitle: profile.contactSubtitle,
        description: profile.contactDescription,
      },
      footer: {
        title: profile.footerTitle ?? user.displayName,
        description: profile.footerDescription,
        tagline: profile.footerTagline,
      },
    };
  }

  /**
   * Returns the profile publicly (without authentication).
   * Uses default user email from environment to find user's profile.
   */
  getPublicProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.status(404).json({ error: 'Profile not found.' });
      }

      const payload = await this.buildProfileResponse(user.id);
      return res.json(payload);
    } catch (error: any) {
      console.error('Error in getPublicProfile:', error?.message || error);
      return res.status(404).json({ error: 'Profile not found.' });
    }
  };

  /**
   * Returns the profile for the authenticated user.
   */
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    try {
      const payload = await this.buildProfileResponse(req.userId);
      return res.json(payload);
    } catch (error) {
      return res.status(404).json({ error: (error as Error).message });
    }
  };

  /**
   * Returns only the textual data from the "About" section publicly (without authentication).
   * Uses default user email from environment to find user's about data.
   */
  getPublicAbout = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.status(404).json({ error: 'About not found.' });
      }

      const profile = await this.profileRepository.getByUserId(user.id);
      if (!profile) {
        return res.status(404).json({ error: 'About not found.' });
      }

      // Split bio into description and description2 based on paragraph breaks
      const bioParts = profile.bio.split('\n\n');
      const description = bioParts[0] || profile.bio;
      const description2 = bioParts.slice(1).join('\n\n') || profile.sectionProjectsSubtitle || '';

      return res.json({
        title: 'Sobre Mim',
        subtitle: 'Desenvolvedor Backend Senior com foco em impacto e qualidade',
        description,
        description2,
        highlights: profile.highlights,
      });
    } catch (error: any) {
      console.error('Error in getPublicAbout:', error?.message || error);
      return res.status(404).json({ error: 'About not found.' });
    }
  };

  /**
   * Returns only the textual data from the "About" section for the authenticated user.
   */
  getAbout = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    try {
      const profile = await this.profileRepository.getByUserId(req.userId);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found.' });
      }
      return res.json({
        title: profile.title,
        subtitle: profile.subtitle,
        description: profile.bio,
        description2: profile.sectionProjectsSubtitle,
        highlights: profile.highlights,
      });
    } catch (error) {
      return res.status(400).json({ error: (error as Error).message });
    }
  };

  /**
   * Updates profile fields belonging to the authenticated user.
   */
  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }
    const payload = updateProfileSchema.parse(req.body);

    // Update User fields (displayName, email) if provided
    const { displayName, email, ...profileData } = payload;
    if (displayName || email) {
      await prisma.user.update({
        where: { id: req.userId },
        data: {
          ...(displayName ? { displayName } : {}),
          ...(email ? { email } : {}),
        },
      });
    }

    const profile = await this.profileRepository.update(req.userId, profileData);
    return res.json(profile);
  };
}

