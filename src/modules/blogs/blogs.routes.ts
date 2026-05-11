import { Router } from 'express';
import { blogsController } from './blogs.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { cacheMiddleware } from '../../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(120), blogsController.getAll);
router.get('/admin', authenticate, authorize('ADMIN'), blogsController.getAllAdmin);
router.get('/my', authenticate, blogsController.getMy);
router.get('/:slug', blogsController.getBySlug);
router.post('/', authenticate, blogsController.create);
router.put('/:id', authenticate, blogsController.update);
router.delete('/:id', authenticate, blogsController.delete);

export default router;
