import path from 'path';
import { appEnv } from '../config/env';

const normalizeBase = (value?: string | null): string => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const getAssetBase = (): string => normalizeBase(appEnv.assetBaseUrl);

export const buildAssetUrl = (relative?: string | null): string | undefined => {
  if (!relative) return relative ?? undefined;
  if (/^https?:\/\//.test(relative)) {
    return relative;
  }
  return `${getAssetBase()}${relative}`;
};

export const assetsRoot = path.resolve(__dirname, '../public/assets');

