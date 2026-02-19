
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/userModel.js';

dotenv.config();

const testSettings = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find a user
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            console.log('User test@example.com not found');
            process.exit(1);
        }

        console.log('\n--- INITIAL SETTINGS ---');
        console.log(user.settings);

        // Update settings
        const newSettings = {
            darkMode: true,
            notifications: false,
            emailAlerts: true
        };

        console.log('\n--- UPDATING SETTINGS ---');
        // Simulate controller logic
        if (!user.settings) user.settings = {};
        user.settings = { ...user.settings, ...newSettings };

        await user.save();
        console.log('Saved.');

        // Fetch again to verify
        const updatedUser = await User.findById(user._id);
        console.log('\n--- VERIFIED SETTINGS ---');
        console.log(updatedUser.settings);

        if (updatedUser.settings.darkMode === true && updatedUser.settings.notifications === false) {
            console.log('\nSUCCESS: Settings persisted correctly.');
        } else {
            console.log('\nFAILURE: Settings matched expected values.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

testSettings();
