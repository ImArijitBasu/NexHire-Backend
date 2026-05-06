import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { applicationsService } from './applications.service';

export const applicationsController = {
  async apply(req: AuthRequest, res: Response) {
    try {
      const application = await applicationsService.apply(req.user!.id, req.user!.name, req.body);
      res.status(201).json({ success: true, application });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to apply' });
    }
  },

  async getMy(req: AuthRequest, res: Response) {
    try {
      const result = await applicationsService.getMy(req.user!.id, req.query as Record<string, string>);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch applications' });
    }
  },

  async getForEmployer(req: AuthRequest, res: Response) {
    try {
      const result = await applicationsService.getForEmployer(req.user!.id, req.query as Record<string, string>);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch applications' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const application = await applicationsService.updateStatus(req.params.id as string, req.user!.id, req.user!.role, req.body.status, req.body.notes);
      res.json({ success: true, application });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to update' });
    }
  },
};
