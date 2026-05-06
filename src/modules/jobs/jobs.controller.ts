import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { jobsService } from './jobs.service';
import { createJobSchema, updateJobSchema, jobQuerySchema } from './jobs.validation';

type Q = Record<string, string>;

export const jobsController = {
  async getAll(req: Request, res: Response) {
    try {
      const query = jobQuerySchema.parse(req.query);
      const result = await jobsService.getAll(query);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch jobs' });
    }
  },

  async getFeatured(_req: Request, res: Response) {
    try {
      const jobs = await jobsService.getFeatured();
      res.json({ success: true, jobs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch featured jobs' });
    }
  },

  async getBySlug(req: Request, res: Response) {
    try {
      const result = await jobsService.getBySlug(req.params.slug as string);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to fetch job' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const data = createJobSchema.parse(req.body);
      const job = await jobsService.create(data, req.user!.id);
      res.status(201).json({ success: true, job });
    } catch (error: any) {
      if (error instanceof ZodError) { res.status(400).json({ success: false, error: error.issues[0].message }); return; }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to create job' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const data = updateJobSchema.parse(req.body);
      const job = await jobsService.update(req.params.id as string, data, req.user!.id, req.user!.role);
      res.json({ success: true, job });
    } catch (error: any) {
      if (error instanceof ZodError) { res.status(400).json({ success: false, error: error.issues[0].message }); return; }
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to update job' });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await jobsService.delete(req.params.id as string, req.user!.id, req.user!.role);
      res.json({ success: true, message: 'Job deleted' });
    } catch (error: any) {
      res.status(error.status || 500).json({ success: false, error: error.message || 'Failed to delete job' });
    }
  },

  async toggleSave(req: AuthRequest, res: Response) {
    try {
      const result = await jobsService.toggleSave(req.params.id as string, req.user!.id);
      res.json({ success: true, ...result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to save job' });
    }
  },

  async getSaved(req: AuthRequest, res: Response) {
    try {
      const savedJobs = await jobsService.getSaved(req.user!.id);
      res.json({ success: true, savedJobs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch saved jobs' });
    }
  },
};
