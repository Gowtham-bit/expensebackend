import express from 'express';
import { getBudget, updateBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getBudget)
    .put(protect, updateBudget);

export default router;
