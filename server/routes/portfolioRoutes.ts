import { Router } from 'express';
import { analyzePortfolio, getPortfolios, getPortfolio, deletePortfolio } from '../controllers/portfolioController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/', protect, analyzePortfolio);
router.get('/', protect, getPortfolios);
router.get('/:id', protect, getPortfolio);
router.delete('/:id', protect, deletePortfolio);

export default router;
