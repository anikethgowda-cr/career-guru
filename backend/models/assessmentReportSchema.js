import mongoose from "mongoose";

const questionAnalysisSchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    transcript: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        default: 0
    },
    feedback: {
        type: String,
        default: ""
    },
    strengths: {
        type: [String],
        default: []
    },
    improvements: {
        type: [String],
        default: []
    },
    idealAnswer: {
        type: String,
        default: ""
    }
});

const overallReportSchema = new mongoose.Schema({
    overallScore: {
        type: Number,
        default: 0
    },
    technicalScore: {
        type: Number,
        default: 0
    },
    communicationScore: {
        type: Number,
        default: 0
    },
    overallSummary: {
        type: String,
        default: ""
    },
    strengths: {
        type: [String],
        default: []
    },
    areasForImprovement: {
        type: [String],
        default: []
    },
    finalRecommendation: {
        type: String,
        default: "Needs Practice"
    }
});

const assessmentReportSchema = new mongoose.Schema({
    assessmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assessment",
        required: true,
        unique: true
    },
    attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssessmentAttempt",
        required: true
    },
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
    videoURL: {
        type: String,
        default: ""
    },
    overallReport: {
        type: overallReportSchema,
        required: true
    },
    questionAnalysis: {
        type: [questionAnalysisSchema],
        default: []
    }
}, {
    timestamps: true
});

const AssessmentReport = mongoose.model("AssessmentReport", assessmentReportSchema);

export default AssessmentReport;
