import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    }
});

const assessmentSchema = new mongoose.Schema({
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
    targetRole: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true
    },
    questions: {
        type: [questionSchema],
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    }
}, {
    timestamps: true
});

const Assessment = mongoose.model("Assessment", assessmentSchema);

export default Assessment;