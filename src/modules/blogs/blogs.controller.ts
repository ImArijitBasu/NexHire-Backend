import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { blogsService } from './blogs.service';

export const blogsController = {
  async getAll(req: Request, res: Response) {
    try { const result = await blogsService.getAll(req.query as Record<string, string>); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to fetch blogs' }); }
  },
  async getBySlug(req: Request, res: Response) {
    try { const blog = await blogsService.getBySlug(req.params.slug as string); res.json({ success: true, blog }); }
    catch (e: any) { res.status(e.status || 500).json({ success: false, error: e.message || 'Failed' }); }
  },
  async create(req: AuthRequest, res: Response) {
    try { const blog = await blogsService.create(req.body, req.user!.id); res.status(201).json({ success: true, blog }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to create blog' }); }
  },
  async update(req: AuthRequest, res: Response) {
    try { const blog = await blogsService.update(req.params.id as string, req.body, req.user!.id, req.user!.role); res.json({ success: true, blog }); }
    catch (e: any) { res.status(e.status || 500).json({ success: false, error: e.message || 'Failed' }); }
  },
  async delete(req: AuthRequest, res: Response) {
    try { await blogsService.delete(req.params.id as string, req.user!.id, req.user!.role); res.json({ success: true, message: 'Blog deleted' }); }
    catch (e: any) { res.status(e.status || 500).json({ success: false, error: e.message || 'Failed' }); }
  },
  async getAllAdmin(req: AuthRequest, res: Response) {
    try { const result = await blogsService.getAllAdmin(req.query as Record<string, string>); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async getMy(req: AuthRequest, res: Response) {
    try { const result = await blogsService.getMy(req.user!.id, req.query as Record<string, string>); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to fetch your blogs' }); }
  },
};
