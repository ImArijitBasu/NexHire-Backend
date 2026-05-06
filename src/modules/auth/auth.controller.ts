import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { authService } from './auth.service';
import {
  registerSchema, loginSchema, googleAuthSchema,
  updateProfileSchema, changePasswordSchema,
} from './auth.validation';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await authService.register(data);
      res.status(201).json({ success: true, ...result });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: error.issues[0].message });
        return;
      }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Registration failed' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json({ success: true, ...result });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: error.issues[0].message });
        return;
      }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Login failed' });
    }
  },

  async googleAuth(req: Request, res: Response) {
    try {
      const data = googleAuthSchema.parse(req.body);
      const result = await authService.googleAuth(data);
      res.json({ success: true, ...result });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: error.issues[0].message });
        return;
      }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Google auth failed' });
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to get user' });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(req.user!.id, data);
      res.json({ success: true, user });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: error.issues[0].message });
        return;
      }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Update failed' });
    }
  },

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user!.id, data.currentPassword, data.newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ success: false, error: error.issues[0].message });
        return;
      }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Password change failed' });
    }
  },
};
