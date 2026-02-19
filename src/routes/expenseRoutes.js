
import express from 'express';
import {
    addTransaction,
    getTransactions,
    deleteTransaction,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, addTransaction).get(protect, getTransactions);
router.route('/:id').delete(protect, deleteTransaction);

export default router;
