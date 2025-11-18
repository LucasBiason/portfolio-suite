import jwt from 'jsonwebtoken';
import { appEnv } from '../config/env';

const TOKEN_EXPIRATION = '8h';

export type JwtPayload = {
  sub: string;
  email: string;
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, appEnv.jwtSecret, { expiresIn: TOKEN_EXPIRATION });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, appEnv.jwtSecret) as JwtPayload;
};

