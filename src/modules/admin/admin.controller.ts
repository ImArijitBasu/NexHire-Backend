import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { adminService } from './admin.service';

type Q = Record<string, string>;

export const adminController = {
  async getUsers(req: AuthRequest, res: Response) {
    try { const result = await adminService.getUsers(req.query as unknown as Q); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to fetch users' }); }
  },
  async updateUserRole(req: AuthRequest, res: Response) {
    try { const user = await adminService.updateUserRole(req.params.id as string, req.body.role); res.json({ success: true, user }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to update role' }); }
  },
  async deleteUser(req: AuthRequest, res: Response) {
    try { await adminService.deleteUser(req.params.id as string, req.user!.id); res.json({ success: true, message: 'User deleted' }); }
    catch (e: any) { res.status(e.status || 500).json({ success: false, error: e.message || 'Failed' }); }
  },
  async getStats(_req: AuthRequest, res: Response) {
    try { const stats = await adminService.getStats(); res.json({ success: true, stats }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to fetch stats' }); }
  },
  async getJobs(req: AuthRequest, res: Response) {
    try { const result = await adminService.getJobs(req.query as unknown as Q); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed to fetch jobs' }); }
  },
  async getContacts(req: AuthRequest, res: Response) {
    try { const result = await adminService.getContacts(req.query as unknown as Q); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async updateContactStatus(req: AuthRequest, res: Response) {
    try { const contact = await adminService.updateContactStatus(req.params.id as string, req.body.status); res.json({ success: true, contact }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async getEmployerStats(req: AuthRequest, res: Response) {
    try { const stats = await adminService.getEmployerStats(req.user!.id); res.json({ success: true, stats }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async getSeekerStats(req: AuthRequest, res: Response) {
    try { const stats = await adminService.getSeekerStats(req.user!.id); res.json({ success: true, stats }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
};
