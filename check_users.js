import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGO_URI;

mongoose.connect(connectionString).then(async () => {
    const db = mongoose.connection.db;
    const expenses = await db.collection("expenses").find({}, { projection: { date: 1, user: 1, amount: 1 } }).sort({ date: 1 }).toArray();

    const userGroups = {};
    expenses.forEach(e => {
        const uid = e.user.toString();
        if (!userGroups[uid]) userGroups[uid] = [];
        userGroups[uid].push(new Date(e.date).toISOString().split('T')[0]);
    });

    console.log("Transactions grouped by User ID:");
    for (const [uid, dates] of Object.entries(userGroups)) {
        console.log(`\nUser: ${uid} has ${dates.length} transactions`);
        console.log(dates.join(", "));
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
