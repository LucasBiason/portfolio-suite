import type { Request, Response } from 'express';
import { registerSchema, loginSchema } from '../schemas/authSchemas';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { slugify } from '../utils/slug';

/**
 * Controls authentication operations such as registration and login,
 * issuing JWT tokens for access to protected routes.
 */
export class AuthController {
  private readonly userRepository = new UserRepository();

  /**
   * Registers a new user applying validations and returning the access JWT.
   */
  register = async (req: Request, res: Response): Promise<Response> => {
    const payload = registerSchema.parse(req.body);
    const existingUser = await this.userRepository.findByEmail(payload.email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await this.userRepository.createUser({
      email: payload.email,
      passwordHash: await hashPassword(payload.password),
      displayName: payload.displayName,
      slug: payload.slug ?? slugify(payload.displayName),
    });

    const token = signToken({ sub: user.id, email: user.email });
    return res.status(201).json({ token });
  };

  /**
   * Performs login by authenticating credentials and issuing the corresponding JWT.
   */
  login = async (req: Request, res: Response): Promise<Response> => {
    const payload = loginSchema.parse(req.body);
    const user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await comparePassword(payload.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = signToken({ sub: user.id, email: user.email });
    return res.json({ token });
  };
}

