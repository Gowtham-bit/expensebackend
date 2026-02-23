import { connectDB } from './config/db.js';
import User from './src/models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

const testUser = async () => {
    await connectDB();
    try {
        const user = await User.create({
            name: "Debug User",
            email: "debugxyz@test.com",
            password: "password123"
        });
        console.log("Success:", user);
    } catch (err) {
        console.error("Signup Crash Error:", err);
    }
    process.exit();
}
testUser();
