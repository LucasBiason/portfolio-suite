import jwt from 'jsonwebtoken';
import { appEnv } from '../config/env';

/** Duration after which issued tokens expire. */
const TOKEN_EXPIRATION = '8h';

/** Shape of the data encoded inside a JWT. */
export type JwtPayload = {
  sub: string;
  email: string;
};

/**
 * Signs a JWT with the application secret and returns the token string.
 *
 * @param payload - Data to encode in the token (user id and email).
 * @returns Signed JWT string valid for TOKEN_EXPIRATION duration.
 */
export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, appEnv.jwtSecret, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Verifies a JWT string against the application secret and returns the decoded payload.
 *
 * @param token - The JWT string to verify.
 * @returns The decoded JwtPayload.
 * @throws JsonWebTokenError when the token is invalid or malformed.
 * @throws TokenExpiredError when the token has expired.
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, appEnv.jwtSecret) as JwtPayload;
};

