import { Router } from 'express';
import { jobsController } from './jobs.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { cacheMiddleware } from '../../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(60), jobsController.getAll);
router.get('/featured', cacheMiddleware(300), jobsController.getFeatured);
router.get('/saved', authenticate, jobsController.getSaved);
router.get('/:slug', jobsController.getBySlug);
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN'), jobsController.create);
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), jobsController.update);
router.delete('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), jobsController.delete);
router.post('/:id/save', authenticate, jobsController.toggleSave);

export default router;
