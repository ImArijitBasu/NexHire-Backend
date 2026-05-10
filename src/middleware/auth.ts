import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { auth } from '../lib/auth';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      // Fallback to better-auth
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      if (session?.user) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user) {
          req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
          return next();
        }
      }
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
        id: string;
        email: string;
        role: string;
        name: string;
      };

      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
      return next();
    } catch (jwtError) {
      // If JWT fails, try better-auth
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      if (session?.user) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (user) {
          req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
          return next();
        }
      }
      throw jwtError;
    }
  } catch (error) {
    logger.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
};
