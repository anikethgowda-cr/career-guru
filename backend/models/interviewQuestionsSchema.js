import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            required: true
        },
        questionDifficulty: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner"
        },
        questions: [
            {
                question: {
                    type: String,
                    required: true
                },
                answer: {
                    type: [String],
                    required: true
                },
                difficulty: {
                    type: String,
                    enum: ["beginner", "intermediate", "advanced"],
                    required: true
                }
            }
        ]
    }, { timestamps: true }
);

const InterviewQuestions = mongoose.model("InterviewQuestions",interviewQuestionSchema);
export default InterviewQuestions;