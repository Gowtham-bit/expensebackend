
import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: ['expense', 'income'],
        },
        category: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        description: {
            type: String,
        },
        frequency: {
            type: String,
            default: "none",
            enum: ["none", "daily", "weekly", "monthly", "yearly"]
        },
        nextDueDate: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
