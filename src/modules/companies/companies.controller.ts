import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { companiesService } from './companies.service';

export const companiesController = {
  async getAll(req: Request, res: Response) {
    try {
      const result = await companiesService.getAll(req.query as any);
      res.json({ success: true, ...result });
    } catch (error: any) { res.status(500).json({ success: false, error: 'Failed to fetch companies' }); }
  },
  async getBySlug(req: Request, res: Response) {
    try {
      const company = await companiesService.getBySlug(req.params.slug);
      res.json({ success: true, company });
    } catch (error: any) { res.status(error.status || 500).json({ success: false, error: error.message || 'Failed' }); }
  },
  async create(req: AuthRequest, res: Response) {
    try {
      const company = await companiesService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, company });
    } catch (error: any) { res.status(error.status || 500).json({ success: false, error: error.message || 'Failed' }); }
  },
  async update(req: AuthRequest, res: Response) {
    try {
      const company = await companiesService.update(req.params.id, req.body, req.user!.id, req.user!.role);
      res.json({ success: true, company });
    } catch (error: any) { res.status(error.status || 500).json({ success: false, error: error.message || 'Failed' }); }
  },
  async getMyCompany(req: AuthRequest, res: Response) {
    try {
      const company = await companiesService.getMyCompany(req.user!.id);
      res.json({ success: true, company });
    } catch (error: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
};
