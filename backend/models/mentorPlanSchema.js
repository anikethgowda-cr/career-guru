import mongoose from "mongoose";

const mentorPlanSchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        price: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        timestamps: true
    }
);

const MentorPlan = mongoose.model("MentorPlan", mentorPlanSchema);

export default MentorPlan;