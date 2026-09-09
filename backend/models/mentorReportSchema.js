import mongoose from "mongoose";

const mentorReportSchema = new mongoose.Schema(
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

        analysisId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ResumeAnalysis",
            required: true
        },

        careerSummary: {
            type: String,
            required: true
        },

        strengths: {
            type: String,
            required: true
        },

        weaknesses: {
            type: String,
            required: true
        },

        missingSkills: {
            type: String,
            required: true
        },

        valueAddingSkills: {
            type: String,
            required: true
        },

        careerGoals: {
            type: String,
            required: true
        },

        mentorGuidance: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

mentorReportSchema.index(
    { studentId: 1, mentorId: 1 },
    { unique: true }
);

const MentorReport = mongoose.model("MentorReport", mentorReportSchema);

export default MentorReport;