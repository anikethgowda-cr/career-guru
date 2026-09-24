import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MentorPlan",
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["pending", "active", "expired", "cancelled"],
            default: "pending"
        },

        reminderSent: {
            type: Boolean,
            default: false
        },

        payoutStatus: {
            type: String,
            enum: ["pending", "processing", "paid", "failed"],
            default: "pending"
        },

        payoutAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

const Subscription = mongoose.model(
    "Subscription",
    subscriptionSchema
);

export default Subscription;