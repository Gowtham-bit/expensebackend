import { connectDB } from './config/db.js';
import mongoose from 'mongoose';
import User from './src/models/userModel.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const createAdmin = async () => {
    await connectDB();
    try {
        const userExists = await User.findOne({ email: 'admin@expenseflow.com' });

        if (userExists) {
            console.log("Admin account already exists! Login with: admin@expenseflow.com / admin123");
            process.exit();
        }

        const user = await User.create({
            name: "Administrator",
            email: "admin@expenseflow.com",
            password: "admin123",
            isAdmin: true
        });

        console.log("SUCCESS! Created new admin account.");
        console.log("Email: admin@expenseflow.com");
        console.log("Password: admin123");

    } catch (err) {
        console.error("Error creating admin:", err);
    }
    process.exit();
}
createAdmin();
