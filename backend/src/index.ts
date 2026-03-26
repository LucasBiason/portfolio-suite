import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import projectsRouter from './routes/projects';
import contactRouter from './routes/contact';
import adminRouter from './routes/admin';
import userRouter from './routes/user';
import aboutRouter from './routes/about';
import experienceRouter from './routes/experience';
import servicesRouter from './routes/services';
import authRouter from './routes/auth';
import profileRouter from './routes/profile';
import assetsRouter from './routes/assets';
import careerRouter from './routes/career';
import stacksRouter from './routes/stacks';
import settingsRouter from './routes/settings';
import statsRouter from './routes/stats';
import categoriesRouter from './routes/categories';
import domainsRouter from './routes/domains';
import educationRouter from './routes/education';
import { mediaRoot } from './utils/assets';
import { appEnv } from './config/env';

const app: Express = express();

// Servir arquivos de mídia (imagens de perfil, projetos, uploads)
app.use('/assets', express.static(mediaRoot));
app.use('/uploads', express.static(path.join(mediaRoot, 'uploads')));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'https://lucasbiason.com',
      'https://www.lucasbiason.com',
      'http://lucasbiason.com',
      'http://www.lucasbiason.com',
    ];
    
    // Permitir qualquer origem que termine com lucasbiason.com (para subdomínios)
    if (origin.includes('lucasbiason.com') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Origem não permitida pelo CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
};

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' } });
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Muitas mensagens enviadas. Tente novamente em 15 minutos.' } });

// Routes
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// Zod validation error handler
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

const start = async () => {
  app.listen(appEnv.port, () => {
    console.log(`Server running on port ${appEnv.port}`);
  });
};

start().catch((error) => {
  console.error('Failed to start portfolio backend:', error);
  process.exit(1);
});

