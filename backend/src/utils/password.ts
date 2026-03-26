import bcrypt from 'bcrypt';

/** Number of bcrypt salt rounds used when hashing passwords. */
const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password using bcrypt.
 *
 * @param plain - The plain-text password to hash.
 * @returns A bcrypt hash string suitable for storage.
 */
export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

/**
 * Compares a plain-text password against a stored bcrypt hash.
 *
 * @param plain - The plain-text password provided by the user.
 * @param hash - The stored bcrypt hash to compare against.
 * @returns True when the password matches the hash, false otherwise.
 */
export const comparePassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

