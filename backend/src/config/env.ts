import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../../configs/.env');
dotenv.config({ path: envPath });

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const appEnv = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  assetBaseUrl: process.env.ASSET_BASE_URL ?? '',
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  defaultEmail: required('PORTFOLIO_DEFAULT_EMAIL'),
  defaultPassword: required('PORTFOLIO_DEFAULT_PASSWORD'),
};

