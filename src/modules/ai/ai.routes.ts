import { Router } from 'express';
import { aiController } from './ai.controller';
import { authenticate } from '../../middleware/auth';
import { aiLimiter } from '../../middleware/rateLimiter';

const router = Router();

router.post('/analyze-resume', authenticate, aiLimiter, aiController.analyzeResume);
router.post('/cover-letter', authenticate, aiLimiter, aiController.generateCoverLetter);
router.post('/job-match', authenticate, aiLimiter, aiController.matchJobs);
router.post('/interview-chat', authenticate, aiLimiter, aiController.interviewChat);
router.get('/history', authenticate, aiController.getHistory);
router.get('/chat-sessions', authenticate, aiController.getChatSessions);
router.get('/chat/:sessionId', authenticate, aiController.getChatMessages);

export default router;
