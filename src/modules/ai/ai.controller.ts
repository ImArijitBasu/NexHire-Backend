import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { aiService } from './ai.service';

export const aiController = {
  async analyzeResume(req: AuthRequest, res: Response) {
    try {
      const { resumeText, targetRole } = req.body;
      if (!resumeText) { res.status(400).json({ success: false, error: 'Resume text is required' }); return; }
      const analysis = await aiService.analyzeResume(req.user!.id, resumeText, targetRole);
      res.json({ success: true, analysis });
    } catch (error: any) { res.status(500).json({ success: false, error: 'AI analysis failed. Please try again.' }); }
  },

  async generateCoverLetter(req: AuthRequest, res: Response) {
    try {
      const { jobTitle, company } = req.body;
      if (!jobTitle || !company) { res.status(400).json({ success: false, error: 'Job title and company are required' }); return; }
      const coverLetter = await aiService.generateCoverLetter(req.user!.id, req.user!.name, req.body);
      res.json({ success: true, coverLetter });
    } catch (error: any) { res.status(500).json({ success: false, error: 'AI generation failed. Please try again.' }); }
  },

  async matchJobs(req: AuthRequest, res: Response) {
    try {
      const result = await aiService.matchJobs(req.user!.id, req.body.preferences);
      res.json({ success: true, result });
    } catch (error: any) { res.status(500).json({ success: false, error: 'AI matching failed. Please try again.' }); }
  },

  async interviewChat(req: AuthRequest, res: Response) {
    try {
      const { message } = req.body;
      if (!message) { res.status(400).json({ success: false, error: 'Message is required' }); return; }
      const result = await aiService.interviewChat(req.user!.id, req.body);
      res.json({ success: true, ...result });
    } catch (error: any) { res.status(500).json({ success: false, error: 'AI chat failed. Please try again.' }); }
  },

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const result = await aiService.getHistory(req.user!.id, req.query as Record<string, string>);
      res.json({ success: true, ...result });
    } catch (error: any) { res.status(500).json({ success: false, error: 'Failed to fetch history' }); }
  },

  async getChatSessions(req: AuthRequest, res: Response) {
    try {
      const sessions = await aiService.getChatSessions(req.user!.id);
      res.json({ success: true, sessions });
    } catch (error: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },

  async getChatMessages(req: AuthRequest, res: Response) {
    try {
      const messages = await aiService.getChatMessages(req.user!.id, req.params.sessionId as string);
      res.json({ success: true, messages });
    } catch (error: any) { res.status(500).json({ success: false, error: 'Failed' }); }
  },
};
