import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

import userRoutes from './src/routes/userRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import { notFound, errorHandler } from './src/middleware/errorMiddleware.js';
import { startCronJobs } from './src/utils/cronJobs.js';

dotenv.config();

connectDB();
startCronJobs();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/users', userRoutes);
app.use('/api/transactions', expenseRoutes);
app.use('/api/upload', uploadRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
