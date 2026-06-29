import { Router } from 'express';
import { generateCoverLetter, getCoverLetters, getCoverLetter, updateCoverLetter, deleteCoverLetter } from '../controllers/coverLetterController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/', protect, generateCoverLetter);
router.get('/', protect, getCoverLetters);
router.get('/:id', protect, getCoverLetter);
router.put('/:id', protect, updateCoverLetter);
router.delete('/:id', protect, deleteCoverLetter);

export default router;
