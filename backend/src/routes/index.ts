import { Express } from 'express';
import rateLimit from 'express-rate-limit';

import projectsRouter from './projects';
import contactRouter from './contact';
import adminRouter from './admin';
import userRouter from './user';
import aboutRouter from './about';
import experienceRouter from './experience';
import servicesRouter from './services';
import authRouter from './auth';
import profileRouter from './profile';
import assetsRouter from './assets';
import careerRouter from './career';
import stacksRouter from './stacks';
import settingsRouter from './settings';
import statsRouter from './stats';
import categoriesRouter from './categories';
import domainsRouter from './domains';
import educationRouter from './education';

/**
 * Rate limiter for authentication endpoints.
 * Allows a maximum of 20 requests per 15-minute window per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
});

/**
 * Rate limiter for contact endpoints.
 * Allows a maximum of 5 requests per 15-minute window per IP.
 */
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas mensagens enviadas. Tente novamente em 15 minutos.' },
});

/**
 * Registers all API routes on the Express application instance.
 * Rate limiters are applied to authentication and contact endpoints.
 *
 * @param app - The Express application instance.
 */
export const registerRoutes = (app: Express): void => {
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/contact', contactLimiter, contactRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/user', userRouter);
  app.use('/api/about', aboutRouter);
  app.use('/api/experience', experienceRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/assets', assetsRouter);
  app.use('/api/career', careerRouter);
  app.use('/api/stacks', stacksRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/education', educationRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/domains', domainsRouter);
};
