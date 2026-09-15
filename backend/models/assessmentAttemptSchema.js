import mongoose from "mongoose";

const questionResponse = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    transcript: {
        type: String
    }
});

const assessmentAttemptSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        required: true
    },
    responses: {
        type: [questionResponse],
        default: []
    },
    videoURL: {
        type: String
    },
    videoPublicId: {
        type: String
    },
    overAllScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "completed"],
        default: "pending"
    }
}, {
    timestamps: true
});

const AssessmentAttempt = mongoose.model(
    "AssessmentAttempt",
    assessmentAttemptSchema
);

export default AssessmentAttempt;