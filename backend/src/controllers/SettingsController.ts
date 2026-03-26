/**
 * Controller for site settings endpoints.
 * Handles theme colors, fonts, SMTP configuration and email testing.
 */
import type { Request, Response } from 'express';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { updateSettingsSchema } from '../schemas/settingsSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Handles CRUD operations for site settings.
 * Separates public (colors/fonts) from authenticated (SMTP) data.
 */
export class SettingsController {
  private readonly settingsRepository = new SettingsRepository();

  /**
   * Returns only public settings (colors and fonts) without authentication.
   * SMTP credentials are never included in this response.
   */
  getPublic = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });
      if (!user) {
        return res.json(this.publicDefaults());
      }
      const settings = await this.settingsRepository.getByUser(user.id);
      if (!settings) return res.json(this.publicDefaults());

      // Return only colors and fonts, never SMTP credentials
      const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, contactEmail, ...publicData } = settings;
      return res.json(publicData);
    } catch {
      return res.json(this.publicDefaults());
    }
  };

  /**
   * Returns all settings including SMTP for the authenticated user.
   * The SMTP password is masked in the response.
   */
  get = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const settings = await this.settingsRepository.getByUser(req.userId);
    if (!settings) return res.json(this.allDefaults());

    // Mask SMTP password in response
    return res.json({
      ...settings,
      smtpPass: settings.smtpPass ? '••••••••' : '',
    });
  };

  /**
   * Updates site settings for the authenticated user.
   * If the SMTP password is the masked placeholder, it is left unchanged.
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const payload = updateSettingsSchema.parse(req.body);

    // Skip update if smtpPass is the masked placeholder
    const data = { ...payload } as Record<string, unknown>;
    if (data.smtpPass === '••••••••') {
      delete data.smtpPass;
    }

    const settings = await this.settingsRepository.upsert(req.userId, data as Record<string, string>);

    return res.json({
      ...settings,
      smtpPass: settings.smtpPass ? '••••••••' : '',
    });
  };

  /**
   * Tests the SMTP connection by sending a test email to the configured contact address.
   */
  testEmail = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });

    try {
      const { sendContactEmail } = await import('../services/email');
      const settings = await this.settingsRepository.getByUser(req.userId);
      const targetEmail = settings?.contactEmail || settings?.smtpUser;

      if (!targetEmail) {
        return res.status(400).json({
          success: false,
          error: 'Configure o SMTP e e-mail de destino antes de testar.',
        });
      }

      await sendContactEmail({
        name: 'Teste do Portfolio Suite',
        email: 'admin@portfolio-suite.local',
        message: 'Este é um e-mail de teste enviado pelo painel de administração do Portfolio Suite. Se você recebeu esta mensagem, as configurações de SMTP estão corretas.',
      });

      return res.json({ success: true, message: `E-mail de teste enviado para ${targetEmail}` });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      return res.status(400).json({ success: false, error: msg });
    }
  };

  /**
   * Returns the default public settings (colors and fonts).
   */
  private publicDefaults() {
    return {
      primaryColor: '#0047AB',
      primaryDarkColor: '#002D6B',
      accentColor: '#30A0FF',
      accentSoftColor: '#99C8FF',
      backgroundColor: '#121417',
      surfaceColor: '#1A1D22',
      textColor: '#ffffff',
      headerFont: 'Raleway',
      bodyFont: 'Open Sans',
    };
  }

  /**
   * Returns all default settings including SMTP fields.
   */
  private allDefaults() {
    return {
      ...this.publicDefaults(),
      smtpHost: '',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPass: '',
      contactEmail: '',
    };
  }
}
