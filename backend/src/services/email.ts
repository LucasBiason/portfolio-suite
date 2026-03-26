import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

/**
 * Busca configurações SMTP do banco (SiteSettings do usuário padrão).
 * Se não existir ou estiver vazio, usa variáveis de ambiente como fallback.
 */
const getSmtpConfig = async () => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: appEnv.defaultEmail },
    });

    if (user) {
      const settings = await prisma.siteSettings.findUnique({
        where: { userId: user.id },
      });

      if (settings?.smtpHost && settings?.smtpUser) {
        return {
          host: settings.smtpHost,
          port: settings.smtpPort,
          secure: settings.smtpSecure,
          user: settings.smtpUser,
          pass: settings.smtpPass,
          contactEmail: settings.contactEmail || settings.smtpUser,
        };
      }
    }
  } catch {
    // Fallback to env vars
  }

  // Fallback: variáveis de ambiente
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    contactEmail: process.env.CONTACT_EMAIL || process.env.SMTP_USER || '',
  };
};

export const sendContactEmail = async (data: ContactEmailData): Promise<void> => {
  const smtp = await getSmtpConfig();

  if (!smtp.user || !smtp.contactEmail) {
    throw new Error('Configurações de e-mail não definidas. Configure SMTP nas configurações do painel.');
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const mailOptions = {
    from: smtp.user,
    to: smtp.contactEmail,
    subject: `Portfólio - Contato: ${data.name}`,
    html: `
      <h2>Nova mensagem do Portfólio</h2>
      <p><strong>Nome:</strong> ${data.name}</p>
      <p><strong>E-mail:</strong> ${data.email}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
    replyTo: data.email,
  };

  await transporter.sendMail(mailOptions);
};
