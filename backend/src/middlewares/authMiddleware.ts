/**
 * Express middleware for JWT authentication.
 * Validates the Authorization Bearer token and attaches the user ID to the request.
 */
import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';

/**
 * Validates the JWT from the Authorization header and populates req.userId and req.userEmail.
 * Returns 401 if the token is missing or invalid.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Next middleware function
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): Response | void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token not provided.' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

