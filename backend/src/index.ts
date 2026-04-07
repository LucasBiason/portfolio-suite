import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import { appEnv } from './config/env';
import { createCorsOptions } from './config/cors';
import { registerRoutes } from './routes/index';
import { mediaRoot } from './utils/assets';

/**
 * Bootstraps and starts the Express application.
 * Configures middleware, static files, routes, and the global error handler.
 */
const start = async (): Promise<void> => {
  const app: Express = express();

  // Trust proxy (Nginx reverse proxy)
  app.set('trust proxy', 1);

  // Security and parsing middleware
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(createCorsOptions()));
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Static file serving for media assets (profile images, project uploads, etc.)
  app.use('/assets', express.static(mediaRoot));
  app.use('/uploads', express.static(path.join(mediaRoot, 'uploads')));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  registerRoutes(app);

  // Global error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Dados inválidos', details: (err as any).errors });
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error(err.stack);
    } else {
      console.error(err.message);
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  });

  app.listen(appEnv.port, () => {
    console.log(`Server running on port ${appEnv.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start portfolio backend:', error);
  process.exit(1);
});
