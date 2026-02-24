
import express from 'express';
import {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
    getAnalytics,
    deleteAllTransactions
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.route('/').post(protect, addTransaction).get(protect, getTransactions);
router.route('/analytics').get(protect, getAnalytics);
router.route('/reset').delete(protect, deleteAllTransactions);
router.route('/:id').delete(protect, deleteTransaction).put(protect, updateTransaction);

export default router;

