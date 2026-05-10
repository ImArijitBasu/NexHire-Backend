import { Router } from 'express';
import { generalController } from './general.controller';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../lib/upload';

const router = Router();

router.post('/contact', generalController.submitContact);
router.post('/newsletter', generalController.subscribeNewsletter);
router.get('/notifications', authenticate, generalController.getNotifications);
router.put('/notifications/:id/read', authenticate, generalController.markNotificationRead);
router.put('/notifications/read-all', authenticate, generalController.markAllRead);
router.post('/reviews', authenticate, generalController.createReview);
router.get('/reviews/:companyId', generalController.getReviews);
router.get('/public-stats', generalController.getPublicStats);

router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }
  res.json({ success: true, url: req.file.path });
});

router.delete('/upload', authenticate, generalController.deleteImage);

export default router;
