import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["admin", "mentor", "user"],
        default: "user"
    },

    phone: {
        type: String,
        default: ""
    },

    isVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userSchema.index(
    { username: 1, role: 1 },
    { unique: true }
);

const User = mongoose.model("User", userSchema);

export default User;