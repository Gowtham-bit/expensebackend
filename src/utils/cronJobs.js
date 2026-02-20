import cron from 'node-cron';
import Expense from '../models/expenseModel.js';

export const startCronJobs = () => {
    // Run every day at midnight (Server time)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running recurring transactions check...');
        try {
            const today = new Date();

            // Find recurring transactions whose nextDueDate is today or earlier
            const recurringTransactions = await Expense.find({
                frequency: { $ne: 'none' },
                nextDueDate: { $lte: today, $ne: null }
            });

            for (const transaction of recurringTransactions) {
                // Determine new next due date
                const frequency = transaction.frequency;
                const d = new Date(transaction.nextDueDate || today);
                if (frequency === 'daily') d.setDate(d.getDate() + 1);
                if (frequency === 'weekly') d.setDate(d.getDate() + 7);
                if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
                if (frequency === 'yearly') d.setFullYear(d.getFullYear() + 1);
                const newNextDueDate = d;

                // Create a new instance that will be the "Next" one
                await Expense.create({
                    user: transaction.user,
                    title: transaction.title,
                    amount: transaction.amount,
                    type: transaction.type,
                    category: transaction.category,
                    date: transaction.nextDueDate, // it executed today 
                    description: transaction.description,
                    frequency: transaction.frequency,
                    nextDueDate: newNextDueDate,
                });

                // Set old instance frequency to 'none' so it stops recurring
                transaction.frequency = 'none';
                transaction.nextDueDate = null;
                await transaction.save();
            }
        } catch (error) {
            console.error('Error running recurring transactions cron:', error);
        }
    });
};
