import { Router } from 'express';
import { generatePath, getPaths, getPath, updateTaskStatus, deletePath } from '../controllers/learningController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { generateLearningPathSchema, updateTaskStatusSchema } from '../validators/learningValidator';

const router = Router();

router.post('/', protect, validate(generateLearningPathSchema), generatePath);
router.get('/', protect, getPaths);
router.get('/:id', protect, getPath);
router.put('/:id/task', protect, validate(updateTaskStatusSchema), updateTaskStatus);
router.delete('/:id', protect, deletePath);

export default router;
