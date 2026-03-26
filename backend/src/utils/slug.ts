/**
 * Converts a string into a URL-safe slug.
 * Lowercases the input, removes diacritics, replaces non-alphanumeric characters
 * with hyphens, strips leading/trailing hyphens, and truncates to 60 characters.
 *
 * @param value - The string to slugify.
 * @returns A URL-safe slug string of at most 60 characters.
 */
export const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

