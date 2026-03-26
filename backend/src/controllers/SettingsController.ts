import type { Request, Response } from 'express';
import { SettingsRepository } from '../repositories/SettingsRepository';
import { updateSettingsSchema } from '../schemas/settingsSchemas';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

export class SettingsController {
  private readonly settingsRepository = new SettingsRepository();

  /** Public: retorna apenas cores e fontes (sem SMTP) */
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

      // Retorna apenas cores e fontes, nunca SMTP
      const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass, contactEmail, ...publicData } = settings;
      return res.json(publicData);
    } catch {
      return res.json(this.publicDefaults());
    }
  };

  /** Auth: retorna todas as configurações incluindo SMTP */
  get = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const settings = await this.settingsRepository.getByUser(req.userId);
    if (!settings) return res.json(this.allDefaults());

    // Mascarar senha no retorno
    return res.json({
      ...settings,
      smtpPass: settings.smtpPass ? '••••••••' : '',
    });
  };

  /** Auth: atualiza configurações */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized.' });
    const payload = updateSettingsSchema.parse(req.body);

    // Se smtpPass for mascarado, não atualizar
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

  /** Auth: testa conexão SMTP */
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
