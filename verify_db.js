
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expense from './src/models/expenseModel.js';
import User from './src/models/userModel.js';

dotenv.config();

const verifyData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.countDocuments();
        const transactions = await Expense.countDocuments();

        console.log(`\n--- DATABASE VERIFICATION ---`);
        console.log(`Total Users: ${users}`);
        console.log(`Total Transactions (Income/Expenses): ${transactions}`);

        if (transactions > 0) {
            const sample = await Expense.findOne().populate('user', 'name email');
            console.log('\nSample Transaction:');
            console.log(`- Title: ${sample.title}`);
            console.log(`- Amount: ${sample.amount}`);
            console.log(`- Type: ${sample.type}`);
            console.log(`- User: ${sample.user.name} (${sample.user.email})`);
        } else {
            console.log('\nNo transactions found yet.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

verifyData();
