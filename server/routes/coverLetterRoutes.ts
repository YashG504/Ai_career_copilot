import { Router } from 'express';
import { generateCoverLetter, getCoverLetters, getCoverLetter, updateCoverLetter, deleteCoverLetter } from '../controllers/coverLetterController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { generateCoverLetterSchema } from '../validators/coverLetterValidator';

const router = Router();

router.post('/', protect, validate(generateCoverLetterSchema), generateCoverLetter);
router.get('/', protect, getCoverLetters);
router.get('/:id', protect, getCoverLetter);
router.put('/:id', protect, updateCoverLetter);
router.delete('/:id', protect, deleteCoverLetter);

export default router;
