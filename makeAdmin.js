import { connectDB } from './config/db.js';
import User from './src/models/userModel.js';
import dotenv from 'dotenv';
dotenv.config();

const makeAdmin = async () => {
    await connectDB();
    try {
        // Find the user and update isAdmin to true
        // Assuming your main email is gowthamsivakumar2006@gmail.com
        const user = await User.findOneAndUpdate(
            { email: 'gowthamsivakumar2006@gmail.com' },
            { isAdmin: true },
            { new: true }
        );

        if (user) {
            console.log("Successfully made admin:", user.email);
        } else {
            console.log("User not found by email! Re-run and change email to the one you login with.");
        }
    } catch (err) {
        console.error("Error:", err);
    }
    process.exit();
}
makeAdmin();
