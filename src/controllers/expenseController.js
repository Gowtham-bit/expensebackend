
import Expense from '../models/expenseModel.js';

// @desc    Add a new transaction (expense or income)
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { title, amount, type, category, date, description } = req.body;

    if (!title || !amount || !type || !category) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    const transaction = await Expense.create({
        user: req.user.id,
        title,
        amount,
        type,
        category,
        date,
        description,
    });

    res.status(201).json(transaction);
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    const transactions = await Expense.find({ user: req.user.id }).sort({
        date: -1,
    });

    res.status(200).json(transactions);
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    const transaction = await Expense.findById(req.params.id);

    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    // Check for user
    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    // Make sure the logged in user matches the transaction user
    if (transaction.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id });
};

export { addTransaction, getTransactions, deleteTransaction };
