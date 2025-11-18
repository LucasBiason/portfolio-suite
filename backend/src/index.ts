import express, { Express, Request, Response } from 'express';
import cors from 'cors';
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
import { assetsRoot } from './utils/assets';
import { appEnv } from './config/env';

const app: Express = express();

app.use('/assets', express.static(assetsRoot));
app.use('/uploads', express.static(path.resolve(__dirname, '../public/uploads')));

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
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/about', aboutRouter);
app.use('/api/experience', experienceRouter);
app.use('/api/services', servicesRouter);
app.use('/api/assets', assetsRouter);

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
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

