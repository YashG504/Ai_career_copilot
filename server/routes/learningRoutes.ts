import { Router } from 'express';
import { generatePath, getPaths, getPath, updateTaskStatus, deletePath } from '../controllers/learningController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/', protect, generatePath);
router.get('/', protect, getPaths);
router.get('/:id', protect, getPath);
router.put('/:id/task', protect, updateTaskStatus);
router.delete('/:id', protect, deletePath);

export default router;
