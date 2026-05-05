/**
 * Email service for sending contact form messages via SMTP.
 *
 * Ordem de resolução:
 * 1. Variáveis de ambiente completas (SMTP_USER, SMTP_PASS, destino via CONTACT_EMAIL ou SMTP_USER)
 * 2. SiteSettings no banco (usuário com e-mail = PORTFOLIO_DEFAULT_EMAIL), com senha/host
 *    complementados pelo .env quando o painel não guarda a senha (ex.: só secret no servidor)
 * 3. Fallback de desenvolvimento: conta Ethereal (SMTP_USE_ETHEREAL=true ou NODE_ENV=development)
 */
import nodemailer from "nodemailer";
import { prisma } from "../config/prisma";
import { appEnv } from "../config/env";

/**
 * Escapes HTML special characters to prevent injection in email bodies.
 *
 * @param s - The raw string to escape
 * @returns The HTML-safe string
 */
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Payload for a contact form email. */
interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

interface SmtpResolved {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  contactEmail: string;
}

const readEnvSmtp = (): SmtpResolved => ({
  host: (process.env.SMTP_HOST || "smtp.gmail.com").trim(),
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  user: (process.env.SMTP_USER || "").trim(),
  pass: (process.env.SMTP_PASS || "").trim(),
  contactEmail: (
    process.env.CONTACT_EMAIL ||
    process.env.SMTP_USER ||
    ""
  ).trim(),
});

const isCompleteSmtp = (c: SmtpResolved): boolean =>
  Boolean(c.user && c.pass && c.contactEmail);

/** Conta Ethereal em cache (apenas fallback de dev). */
let etherealCreds: { user: string; pass: string } | null = null;

const getEtherealCreds = async (): Promise<{ user: string; pass: string }> => {
  if (!etherealCreds) {
    const account = await nodemailer.createTestAccount();
    etherealCreds = { user: account.user, pass: account.pass };
    console.warn(
      `[email] Usando SMTP Ethereal (mensagens não chegam a caixas reais). user=${account.user}`,
    );
  }
  return etherealCreds;
};

const useEtherealFallback = (): boolean =>
  process.env.SMTP_USE_ETHEREAL === "true" || appEnv.nodeEnv === "development";

/**
 * Loads SMTP configuration from the environment, then the database (default portfolio user),
 * optionally Ethereal in development when nothing else is configured.
 *
 * @returns Resolved SMTP configuration object
 */
const getSmtpConfig = async (): Promise<SmtpResolved> => {
  const envOnly = readEnvSmtp();
  if (isCompleteSmtp(envOnly)) {
    return envOnly;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email: appEnv.defaultEmail },
    });

    if (user) {
      const settings = await prisma.siteSettings.findUnique({
        where: { userId: user.id },
      });

      const host = settings?.smtpHost?.trim();
      const smtpUser = settings?.smtpUser?.trim();
      if (host && smtpUser) {
        const merged: SmtpResolved = {
          host,
          port: settings?.smtpPort ?? 587,
          secure: settings?.smtpSecure ?? false,
          user: smtpUser,
          pass: settings?.smtpPass?.trim() || envOnly.pass,
          contactEmail:
            settings?.contactEmail?.trim() || smtpUser || envOnly.contactEmail,
        };
        if (isCompleteSmtp(merged)) {
          return merged;
        }
      }
    }
  } catch {
    // segue para fallbacks
  }

  if (useEtherealFallback()) {
    const creds = await getEtherealCreds();
    return {
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      user: creds.user,
      pass: creds.pass,
      contactEmail: creds.user,
    };
  }

  return envOnly;
};

/**
 * Sends a contact form email using the configured SMTP settings.
 *
 * @param data - The contact form payload containing name, email and message
 * @throws Error if SMTP credentials are not configured
 */
export const sendContactEmail = async (
  data: ContactEmailData,
): Promise<void> => {
  const smtp = await getSmtpConfig();

  if (!smtp.user || !smtp.contactEmail) {
    throw new Error(
      "Configurações de e-mail não definidas. Configure SMTP nas configurações do painel.",
    );
  }

  if (!smtp.pass) {
    throw new Error(
      "Senha SMTP ausente. Defina SMTP_PASS no servidor ou informe a senha no painel (Gmail: use senha de app).",
    );
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
      <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
    `,
    replyTo: data.email,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.warn(`[email] Pré-visualização Ethereal: ${previewUrl}`);
  }
};
