
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/userModel.js';

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Get email from command line argument or use default
        const email = process.argv[2] || 'test@example.com';

        if (email === 'test@example.com') {
            console.log('Usage: node make_admin.js <user_email>');
            console.log('Using default: test@example.com');
        }

        const user = await User.findOne({ email });

        if (user) {
            user.isAdmin = true;
            await user.save();
            console.log(`SUCCESS: User ${user.name} (${user.email}) is now an Admin!`);
            console.log('Please Log Out and Log In again to see the Admin Dashboard.');
        } else {
            console.log(`ERROR: User with email "${email}" not found.`);
            console.log('Please Sign Up in the app first, then run this script again.');
        }

        process.exit();
    } catch (error) {
        console.error('PROMOTION FAILED:', error.message);
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
};

makeAdmin();
