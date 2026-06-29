import { Router } from 'express';
import { startInterview, submitAnswer, getInterviews, getInterview, deleteInterview } from '../controllers/interviewController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/start', protect, startInterview);
router.post('/:id/answer', protect, submitAnswer);
router.get('/', protect, getInterviews);
router.get('/:id', protect, getInterview);
router.delete('/:id', protect, deleteInterview);

export default router;
