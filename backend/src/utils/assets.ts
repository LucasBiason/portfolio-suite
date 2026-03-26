import path from 'path';
import { appEnv } from '../config/env';

/**
 * Removes a trailing slash from a base URL string.
 *
 * @param value - The URL string to normalize, or null/undefined.
 * @returns The URL without a trailing slash, or an empty string when falsy.
 */
const normalizeBase = (value?: string | null): string => {
  if (!value) return '';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

/**
 * Returns the asset base URL from configuration, normalized (no trailing slash).
 *
 * @returns The base URL string, or empty string when not configured.
 */
const getAssetBase = (): string => {
  return normalizeBase(appEnv.assetBaseUrl);
};

/**
 * Resolves a relative asset path to an absolute URL using the configured base URL.
 * Already-absolute URLs (http/https) are returned unchanged.
 * When no base URL is configured, the relative path is returned as-is so the
 * browser resolves it against the current origin.
 *
 * @param relative - A relative asset path or an absolute URL.
 * @returns The resolved URL, or undefined when the input is falsy.
 */
export const buildAssetUrl = (relative?: string | null): string | undefined => {
  if (!relative) return relative ?? undefined;
  if (/^https?:\/\//.test(relative)) {
    return relative;
  }
  const base = getAssetBase();
  if (!base) {
    return relative;
  }
  return `${base}${relative}`;
};

/**
 * Absolute path to the media root directory.
 * Resolved from MEDIA_PATH environment variable, falling back to ../media
 * relative to the project root.
 * In production the path is typically a Docker volume mounted at /media.
 */
export const mediaRoot = process.env.MEDIA_PATH
  || path.resolve(__dirname, '../../../media');

/**
 * Alias for mediaRoot kept for backwards compatibility.
 * @deprecated Use mediaRoot directly.
 */
export const assetsRoot = mediaRoot;

