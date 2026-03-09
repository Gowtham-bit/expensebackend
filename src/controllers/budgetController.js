import Budget from '../models/budgetModel.js';
import Expense from '../models/expenseModel.js';

// @desc    Get user budget & actual category spending
// @route   GET /api/budget
// @access  Private
const getBudget = async (req, res) => {
    try {
        const userid = req.user._id;

        // 1. Fetch user's budget settings
        let budget = await Budget.findOne({ user: userid });

        if (!budget) {
            // Create default if none exists
            budget = await Budget.create({
                user: userid,
                monthlyBudget: 0,
                categoryBudgets: []
            });
        }

        // 2. Calculate actual spending for the current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Calculate Category Wise Expense for the current month
        const categorySpendingAggregate = await Expense.aggregate([
            {
                $match: {
                    user: userid,
                    type: 'expense',
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: "$category",
                    spent: { $sum: "$amount" }
                }
            },
            { $project: { name: "$_id", spent: 1, _id: 0 } }
        ]);

        const totalSpent = categorySpendingAggregate.reduce((sum, cat) => sum + cat.spent, 0);

        // Fetch user preferences for default categories, use user.settings.categories
        const categories = req.user.settings?.categories || [
            "Shopping", "Food & Drink", "Transport", "Housing", "Entertainment", "Other"
        ];

        // Combine categories, budget settings, and actual spending
        const budgetCategories = categories.map(catName => {
            const actualSpent = categorySpendingAggregate.find(c => c.name === catName)?.spent || 0;
            const categoryBudgetSettings = budget.categoryBudgets.find(c => c.name === catName)?.budget || 0;

            return {
                name: catName,
                budget: categoryBudgetSettings,
                spent: actualSpent,
                icon: getCategoryIcon(catName) // Custom helper to map names to emojis/icons
            };
        });

        // Add any categories that have spending but aren't in defaults/settings
        categorySpendingAggregate.forEach(cat => {
            if (!categories.includes(cat.name)) {
                const categoryBudgetSettings = budget.categoryBudgets.find(c => c.name === cat.name)?.budget || 0;
                budgetCategories.push({
                    name: cat.name,
                    budget: categoryBudgetSettings,
                    spent: cat.spent,
                    icon: getCategoryIcon(cat.name)
                });
            }
        });

        res.status(200).json({
            monthlyBudget: budget.monthlyBudget,
            totalSpent,
            budgetCategories
        });

    } catch (error) {
        res.status(500);
        throw new Error('Server Error fetching budget');
    }
};

// @desc    Update user budget
// @route   PUT /api/budget
// @access  Private
const updateBudget = async (req, res) => {
    try {
        const userid = req.user._id;
        const { monthlyBudget, categoryBudgets } = req.body;

        let budget = await Budget.findOne({ user: userid });

        if (!budget) {
            budget = new Budget({ user: userid });
        }

        if (monthlyBudget !== undefined) budget.monthlyBudget = monthlyBudget;
        if (categoryBudgets !== undefined) budget.categoryBudgets = categoryBudgets;

        const updatedBudget = await budget.save();
        res.status(200).json(updatedBudget);

    } catch (error) {
        res.status(500);
        throw new Error('Server Error updating budget');
    }
};


// Simple helper to assign default icons to category strings 
const getCategoryIcon = (categoryName) => {
    const icons = {
        'Housing': '🏠',
        'Transport': '🚗',
        'Food & Drink': '🍔',
        'Shopping': '🛍️',
        'Entertainment': '🎬',
        'Healthcare': '🏥',
        'Education': '📚',
        'Utilities': '💡',
        'Groceries': '🛒',
        'Travel': '✈️',
        'Salary': '💰',
        'Income': '💵',
        'Other': '📦'
    };
    return icons[categoryName] || '🏷️';
};

export { getBudget, updateBudget };
