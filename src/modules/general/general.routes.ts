import { Router } from 'express';
import { generalController } from './general.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/contact', generalController.submitContact);
router.post('/newsletter', generalController.subscribeNewsletter);
router.get('/notifications', authenticate, generalController.getNotifications);
router.put('/notifications/:id/read', authenticate, generalController.markNotificationRead);
router.put('/notifications/read-all', authenticate, generalController.markAllRead);
router.post('/reviews', authenticate, generalController.createReview);
router.get('/reviews/:companyId', generalController.getReviews);
router.get('/public-stats', generalController.getPublicStats);

export default router;
