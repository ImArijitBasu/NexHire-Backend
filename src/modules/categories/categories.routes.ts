import { Router } from 'express';
import { categoriesController } from './categories.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { cacheMiddleware } from '../../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(600), categoriesController.getAll);
router.post('/', authenticate, authorize('ADMIN'), categoriesController.create);
router.put('/:id', authenticate, authorize('ADMIN'), categoriesController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), categoriesController.delete);

export default router;
