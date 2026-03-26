/**
 * Email service for sending contact form messages via SMTP.
 * Configuration is loaded from the database (SiteSettings) with environment variable fallback.
 */
import nodemailer from 'nodemailer';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

/**
 * Escapes HTML special characters to prevent injection in email bodies.
 *
 * @param s - The raw string to escape
 * @returns The HTML-safe string
 */
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Payload for a contact form email. */
interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

/**
 * Loads SMTP configuration from the database (SiteSettings of the default user).
 * Falls back to environment variables when the database record is missing or incomplete.
 *
 * @returns Resolved SMTP configuration object
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
    // Fallback to environment variables
  }

  // Fallback: environment variables
  return {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    contactEmail: process.env.CONTACT_EMAIL || process.env.SMTP_USER || '',
  };
};

/**
 * Sends a contact form email using the configured SMTP settings.
 *
 * @param data - The contact form payload containing name, email and message
 * @throws Error if SMTP credentials are not configured
 */
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
    subject: `Portfólio - Contato: ${escapeHtml(data.name)}`,
    html: `
      <h2>Nova mensagem do Portfólio</h2>
      <p><strong>Nome:</strong> ${escapeHtml(data.name)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(data.email)}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
    `,
    replyTo: data.email,
  };

  await transporter.sendMail(mailOptions);
};
