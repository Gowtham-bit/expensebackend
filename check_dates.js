import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGO_URI;

mongoose.connect(connectionString).then(async () => {
    const db = mongoose.connection.db;
    const expenses = await db.collection("expenses").find({}, { projection: { date: 1, title: 1, amount: 1 } }).sort({ date: 1 }).toArray();

    console.log(`Total transactions in MongoDB: ${expenses.length}`);
    if (expenses.length > 0) {
        console.log("\nAll transactions by date:");
        expenses.forEach(e => {
            console.log(`- [${new Date(e.date).toISOString().split('T')[0]}] ${e.title} (₹${e.amount})`);
        });
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
