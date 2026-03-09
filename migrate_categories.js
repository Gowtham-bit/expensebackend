import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/userModel.js";

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

const updateCategories = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        for (const user of users) {
            if (user.settings && user.settings.categories) {
                const newCategories = user.settings.categories.map(cat =>
                    cat === 'Dining' ? 'Entertainment' : cat
                );
                user.settings.categories = newCategories;
                await user.save();
            }
        }
        console.log("Categories updated successfully!");
    } catch (e) {
        console.error(e);
    }

    process.exit(0);
}

updateCategories();
