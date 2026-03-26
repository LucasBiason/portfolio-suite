import path from 'path';
import { appEnv } from '../config/env';

const normalizeBase = (value?: string | null): string => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const getAssetBase = (): string => {
  // In production, use the same domain (no subdomain)
  // Assets are served via Nginx at /assets and /uploads
  const base = normalizeBase(appEnv.assetBaseUrl);
  if (base && !base.includes('api.lucasbiason.com')) {
    return base;
  }
  // Default to empty string so relative paths work correctly
  return '';
};

export const buildAssetUrl = (relative?: string | null): string | undefined => {
  if (!relative) return relative ?? undefined;
  if (/^https?:\/\//.test(relative)) {
    return relative;
  }
  const base = getAssetBase();
  // If base is empty, return relative path (will be resolved by browser to current domain)
  if (!base) {
    return relative;
  }
  return `${base}${relative}`;
};

// Media root: /media (mounted as Docker volume)
// In dev: ../media (relative to project root)
// In production (compiled): /media (Docker volume mount)
export const mediaRoot = process.env.MEDIA_PATH
  || path.resolve(__dirname, '../../../media');

// Legacy: keep assetsRoot pointing to media for backwards compatibility
export const assetsRoot = mediaRoot;

