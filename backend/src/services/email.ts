import nodemailer from 'nodemailer';

interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendContactEmail = async (data: ContactEmailData): Promise<void> => {
  const transporter = createTransporter();
  const contactEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER;
  
  if (!contactEmail) {
    throw new Error('CONTACT_EMAIL or SMTP_USER not configured');
  }
  
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: contactEmail,
    subject: `Portfolio Contact: ${data.name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
    replyTo: data.email,
  };
  
  await transporter.sendMail(mailOptions);
};


