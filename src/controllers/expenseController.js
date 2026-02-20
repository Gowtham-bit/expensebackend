
import Expense from '../models/expenseModel.js';

// @desc    Add a new transaction (expense or income)
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { title, amount, type, category, date, description, frequency } = req.body;

    if (!title || !amount || !type || !category) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    let nextDueDate = null;
    if (frequency && frequency !== 'none') {
        const d = new Date(date || Date.now());
        if (frequency === 'daily') d.setDate(d.getDate() + 1);
        if (frequency === 'weekly') d.setDate(d.getDate() + 7);
        if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
        if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
        nextDueDate = d;
    }

    const transaction = await Expense.create({
        user: req.user._id,
        title,
        amount,
        type,
        category,
        date,
        description,
        frequency: frequency || 'none',
        nextDueDate,
    });

    res.status(201).json(transaction);
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    const transactions = await Expense.find({ user: req.user._id }).sort({
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
    if (transaction.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await transaction.deleteOne();

    res.status(200).json({ id: req.params.id });
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    const { title, amount, type, category, date, description, frequency } = req.body;

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
    if (transaction.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized');
    }

    transaction.title = title || transaction.title;
    transaction.amount = amount || transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date || transaction.date;
    transaction.description = description !== undefined ? description : transaction.description;

    if (frequency !== undefined) {
        transaction.frequency = frequency;
        if (frequency !== 'none') {
            const d = new Date(transaction.date || Date.now());
            if (frequency === 'daily') d.setDate(d.getDate() + 1);
            if (frequency === 'weekly') d.setDate(d.getDate() + 7);
            if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
            if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
            transaction.nextDueDate = d;
        } else {
            transaction.nextDueDate = null;
        }
    }

    const updatedTransaction = await transaction.save();

    res.status(200).json(updatedTransaction);
};


// @desc    Get analytics data
// @route   GET /api/transactions/analytics
// @access  Private
const getAnalytics = async (req, res) => {
    try {
        const userid = req.user._id;

        // 1. Total Income & Expense
        const totalIncomeExpense = await Expense.aggregate([
            { $match: { user: userid } },
            {
                $group: {
                    _id: null,
                    totalIncome: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                        }
                    },
                    totalExpense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        // 2. Category Wise Expense
        const categoryData = await Expense.aggregate([
            { $match: { user: userid, type: 'expense' } },
            {
                $group: {
                    _id: "$category",
                    value: { $sum: "$amount" }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // Add colors to categories (simple round robin or predefined)
        const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A3'];
        const coloredCategoryData = categoryData.map((item, index) => ({
            ...item,
            color: COLORS[index % COLORS.length]
        }));


        // 3. Monthly Data
        const monthlyData = await Expense.aggregate([
            { $match: { user: userid } },
            {
                $group: {
                    _id: { $month: "$date" },
                    income: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
                        }
                    },
                    expense: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
                        }
                    }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlyData = monthlyData.map(d => ({
            month: monthNames[d._id - 1],
            income: d.income,
            expenses: d.expense
        }));

        // 4. Weekly Data (Last 7 days expenses)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const weeklyData = await Expense.aggregate([
            {
                $match: {
                    user: userid,
                    type: 'expense',
                    date: { $gte: last7Days }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$date" },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const formattedWeeklyData = weeklyData.map(d => ({
            day: days[d._id - 1],
            amount: d.amount
        }));

        res.status(200).json({
            totalIncome: totalIncomeExpense[0]?.totalIncome || 0,
            totalExpense: totalIncomeExpense[0]?.totalExpense || 0,
            categoryData: coloredCategoryData,
            monthlyData: formattedMonthlyData,
            weeklyExpenses: formattedWeeklyData
        });

    } catch (error) {
        res.status(500);
        throw new Error('Server Error');
    }
};

export { addTransaction, getTransactions, deleteTransaction, updateTransaction, getAnalytics };

