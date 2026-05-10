import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { generalService } from './general.service';

export const generalController = {
  async submitContact(req: Request, res: Response) {
    try { await generalService.submitContact(req.body); res.status(201).json({ success: true, message: 'Message sent successfully' }); }
    catch (e: any) { res.status(e.status || 500).json({ success: false, error: e.message || 'Failed' }); }
  },
  async subscribeNewsletter(req: Request, res: Response) {
    try { await generalService.subscribeNewsletter(req.body.email); res.status(201).json({ success: true, message: 'Subscribed successfully' }); }
    catch (e: any) { res.status(e.status || 500).json({ success: false, error: e.message || 'Failed' }); }
  },
  async getNotifications(req: AuthRequest, res: Response) {
    try { const result = await generalService.getNotifications(req.user!.id); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async markNotificationRead(req: AuthRequest, res: Response) {
    try { await generalService.markNotificationRead(req.params.id as string); res.json({ success: true }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async markAllRead(req: AuthRequest, res: Response) {
    try { await generalService.markAllNotificationsRead(req.user!.id); res.json({ success: true }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async createReview(req: AuthRequest, res: Response) {
    try { const review = await generalService.createReview(req.user!.id, req.body); res.status(201).json({ success: true, review }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async getReviews(req: Request, res: Response) {
    try { const result = await generalService.getReviews(req.params.companyId as string); res.json({ success: true, ...result }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async getPublicStats(_req: Request, res: Response) {
    try { const stats = await generalService.getPublicStats(); res.json({ success: true, stats }); }
    catch (e: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
  async deleteImage(req: AuthRequest, res: Response) {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ success: false, error: 'URL is required' });
        return;
      }
      
      // Extract public_id from Cloudinary URL
      const parts = url.split('/');
      // Usually it's after /upload/v1234/
      const uploadIndex = parts.findIndex((p: string) => p === 'upload');
      if (uploadIndex === -1) {
        res.status(400).json({ success: false, error: 'Invalid Cloudinary URL' });
        return;
      }
      
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      await cloudinary.uploader.destroy(publicId);
      res.json({ success: true, message: 'Image deleted' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: 'Failed to delete image' });
    }
  },
};
