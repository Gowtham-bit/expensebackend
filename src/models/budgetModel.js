import mongoose from 'mongoose';

const budgetSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        monthlyBudget: {
            type: Number,
            required: true,
            default: 0,
        },
        categoryBudgets: [
            {
                name: {
                    type: String,
                    required: true,
                },
                budget: {
                    type: Number,
                    required: true,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
