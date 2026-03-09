
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        phone: {
            type: String,
            default: "",
        },
        location: {
            type: String,
            default: "",
        },
        avatar: {
            type: String,
            default: "",
        },
        settings: {
            darkMode: {
                type: Boolean,
                default: false,
            },
            notifications: {
                type: Boolean,
                default: true,
            },
            emailAlerts: {
                type: Boolean,
                default: true,
            },
            categories: {
                type: [String],
                default: [
                    "Shopping",
                    "Food & Drink",
                    "Transport",
                    "Housing",
                    "Entertainment",
                    "Salary",
                    "Other"
                ]
            }
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
