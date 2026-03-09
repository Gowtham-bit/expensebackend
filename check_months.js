import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.MONGO_URI;

mongoose.connect(connectionString).then(async () => {
    const db = mongoose.connection.db;
    const expenses = await db.collection("expenses").find({}, { projection: { date: 1, user: 1 } }).sort({ date: 1 }).toArray();

    const userGroups = {};
    expenses.forEach(e => {
        const uid = e.user.toString();
        if (!userGroups[uid]) userGroups[uid] = new Set();
        userGroups[uid].add(new Date(e.date).toISOString().split('T')[0].substring(0, 7));
    });

    console.log("Users and their months:");
    for (const [uid, monthsSet] of Object.entries(userGroups)) {
        const months = Array.from(monthsSet);
        console.log(`User: ${uid} has data in months: ${months.join(', ')}`);
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
