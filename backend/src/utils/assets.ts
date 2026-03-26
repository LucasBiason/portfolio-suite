import path from 'path';
import { appEnv } from '../config/env';

const normalizeBase = (value?: string | null): string => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const getAssetBase = (): string => {
  return normalizeBase(appEnv.assetBaseUrl);
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

