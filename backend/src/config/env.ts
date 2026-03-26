import path from 'path';
import dotenv from 'dotenv';

// Try multiple paths for .env file
const possiblePaths = [
  path.resolve(__dirname, '../../configs/.env'), // From compiled dist
  path.resolve(process.cwd(), 'configs/.env'), // From project root
  path.resolve(process.cwd(), '../configs/.env'), // From backend directory
];

let envLoaded = false;
for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn(`Warning: Could not load .env from any of: ${possiblePaths.join(', ')}`);
}

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
};

