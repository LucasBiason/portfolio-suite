import { CorsOptions } from 'cors';

/** Default origins allowed in development when no environment variable is set. */
const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
];

/**
 * Parses the CORS_ALLOWED_ORIGINS environment variable into an array of origin strings.
 * Falls back to development defaults when the variable is not set.
 *
 * @returns Array of allowed origin strings.
 */
const resolveAllowedOrigins = (): string[] => {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (!raw) return DEV_ORIGINS;
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
};

/**
 * Builds the CORS options object used by the Express cors() middleware.
 *
 * Allowed origins are read from the CORS_ALLOWED_ORIGINS environment variable
 * (comma-separated list). Falls back to localhost defaults for development.
 * Requests without an origin header (e.g. mobile apps, Postman) are always allowed.
 * An origin is also accepted when it contains any hostname present in the allowed list
 * (covers subdomains of production domains).
 *
 * @returns CorsOptions compatible with the cors npm package.
 */
export const createCorsOptions = (): CorsOptions => {
  const allowedOrigins = resolveAllowedOrigins();

  return {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const isExactMatch = allowedOrigins.includes(origin);
      const isSubdomainMatch = allowedOrigins.some((allowed) => {
        try {
          const { hostname } = new URL(allowed);
          return origin.includes(hostname);
        } catch {
          return false;
        }
      });

      if (isExactMatch || isSubdomainMatch) {
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
};
