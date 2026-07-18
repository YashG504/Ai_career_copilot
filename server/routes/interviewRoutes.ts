import { Router } from 'express';
import { startInterview, submitAnswer, getInterviews, getInterview, deleteInterview } from '../controllers/interviewController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { startInterviewSchema, submitAnswerSchema } from '../validators/interviewValidator';

const router = Router();

router.post('/start', protect, validate(startInterviewSchema), startInterview);
router.post('/:id/answer', protect, validate(submitAnswerSchema), submitAnswer);
router.get('/', protect, getInterviews);
router.get('/:id', protect, getInterview);
router.delete('/:id', protect, deleteInterview);

export default router;
