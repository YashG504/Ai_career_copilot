import { Router } from 'express';
import { analyzeSkillGap, getSkillGaps, getSkillGap, deleteSkillGap } from '../controllers/skillGapController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/', protect, analyzeSkillGap);
router.get('/', protect, getSkillGaps);
router.get('/:id', protect, getSkillGap);
router.delete('/:id', protect, deleteSkillGap);

export default router;
