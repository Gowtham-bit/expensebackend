import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const connectionString = process.env.MONGO_URI;

mongoose.connect(connectionString).then(async () => {
    const db = mongoose.connection.db;

    // 1. Find an expense to get a valid user
    const expenses = await db.collection("expenses").find({}).toArray();
    if (expenses.length === 0) {
        fs.writeFileSync('db_analytics_test.json', JSON.stringify({ error: "No expenses in DB at all." }));
        process.exit(0);
    }

    const user_id = expenses[0].user;

    // 2. See if there are any expenses for this user
    const userExpenses = await db.collection("expenses").find({ user: user_id }).toArray();
    const typeExpenseCount = await db.collection("expenses").countDocuments({ user: user_id, type: 'expense' });

    const categoryData = await db.collection("expenses").aggregate([
        { $match: { user: user_id, type: 'expense' } },
        {
            $group: {
                _id: "$category",
                value: { $sum: "$amount" }
            }
        },
        { $project: { name: "$_id", value: 1, _id: 0 } }
    ]).toArray();

    const monthlyData = await db.collection("expenses").aggregate([
        { $match: { user: user_id } },
        {
            $group: {
                _id: { $month: "$date" },
                income: {
                    $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
                },
                expense: {
                    $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
                }
            }
        },
        { $sort: { "_id": 1 } }
    ]).toArray();

    const res = {
        userId: user_id,
        totalTx: userExpenses.length,
        expenseTypeTx: typeExpenseCount,
        categoryData,
        monthlyData,
        sampleUserTxType: userExpenses.length > 0 ? userExpenses[0].type : "N/A",
        sampleDate: userExpenses[0].date
    };

    fs.writeFileSync('db_analytics_test.json', JSON.stringify(res, null, 2));

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
