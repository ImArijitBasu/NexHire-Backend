import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { categoriesService } from './categories.service';

export const categoriesController = {
  async getAll(_req: Request, res: Response) {
    try { const categories = await categoriesService.getAll(); res.json({ success: true, categories }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to fetch categories' }); }
  },
  async create(req: AuthRequest, res: Response) {
    try { const category = await categoriesService.create(req.body); res.status(201).json({ success: true, category }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to create category' }); }
  },
  async update(req: AuthRequest, res: Response) {
    try { const category = await categoriesService.update(req.params.id, req.body); res.json({ success: true, category }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to update category' }); }
  },
  async delete(req: AuthRequest, res: Response) {
    try { await categoriesService.delete(req.params.id); res.json({ success: true, message: 'Category deleted' }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to delete category' }); }
  },
};
