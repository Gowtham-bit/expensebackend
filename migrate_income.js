import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/userModel.js";
import Expense from "./src/models/expenseModel.js";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const updateIncomeCategories = async () => {
    await connectDB();

    try {
        // 1. Update User Settings
        const users = await User.find({});
        for (const user of users) {
            if (user.settings && user.settings.categories) {
                const newCategories = user.settings.categories.map(cat =>
                    cat === 'Income' ? 'Salary' : cat
                );

                // Remove duplicates since Salary might already exist
                user.settings.categories = [...new Set(newCategories)];
                await user.save();
            }
        }
        console.log("User default categories updated.");

        // 2. Update existing transactions
        const result = await Expense.updateMany(
            { category: 'Income' },
            { $set: { category: 'Salary' } }
        );
        console.log(`Updated ${result.modifiedCount} 'Income' transactions to 'Salary'.`);

    } catch (e) {
        console.error(e);
    }

    process.exit(0);
}

updateIncomeCategories();
