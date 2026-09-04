import InterviewQuestions from "../models/interviewQuestionsSchema.js";
import UserProfile from "../models/userProfileSchema.js";
import aiService from "../services/aiServices.js";


export const generateInterviewQuestions = async (req, res) => {

    const userId = req.userId;
    const { questionDifficulty } = req.body;

    try {

        if (!questionDifficulty) {
            return res.status(400).json({
                success: false,
                message: "Please provide the question difficulty"
            });
        }

        const userRecord = await UserProfile.findOne({ userId });

        if (!userRecord) {
            return res.status(404).json({
                success: false,
                message: "User profile not found"
            });
        }

        const role = userRecord.preferredJobRole;
        const specialization = userRecord.preferredSpecialization.join(", ");

        const prompt = `You are an expert technical interviewer.

            Generate interview questions for a candidate interested in the following role and specialization:

            Role: ${role}

            Preferred Specialization: ${specialization}

            Requested difficulty level: ${questionDifficulty}

            Generate approximately 20-45 interview questions.

            Requirements:

            - Questions must be relevant to the candidate's preferred job role.
            - Questions must be specifically relevant to the candidate's preferred specialization.
            - Questions should cover the technologies, tools, concepts, and technical knowledge related to the preferred specialization.
            - Questions must match the requested difficulty level.
            - Focus on technical and role-specific knowledge.
            - Provide an answer for every question.
            - Each question must have its own difficulty.
            - The answer for every question MUST be an array of strings.
            - Each string inside the answer array must represent one separate point of the answer.
            - Provide approximately 6 to 7 clear and concise points for each answer.
            - Each answer point should contain useful technical information.
            - Do not write the entire answer as one long string.
            - Do not combine all answer points into a single string.
            - The answer points should be suitable for displaying individually in a UI using a map function.
            - Do not provide unnecessary explanations outside the JSON.
            - Return ONLY valid JSON.
            - Do not use markdown.
            - Do not wrap the response inside a code block.

            The difficulty of every question must be exactly:
            "${questionDifficulty}"

            Return exactly this structure:

            {
                "role": "${role}",
                "questionDifficulty": "${questionDifficulty}",
                "questions": [
                    {
                        "question": "Question 1",
                        "answer": [
                            "Answer point 1",
                            "Answer point 2",
                            "Answer point 3",
                            "Answer point 4",
                            "Answer point 5",
                            "Answer point 6",
                            "Answer point 7"
                        ],
                        "difficulty": "${questionDifficulty}"
                    },
                    {
                        "question": "Question 2",
                        "answer": [
                            "Answer point 1",
                            "Answer point 2",
                            "Answer point 3",
                            "Answer point 4",
                            "Answer point 5",
                            "Answer point 6",
                            "Answer point 7"
                        ],
                        "difficulty": "${questionDifficulty}"
                    }
                ]
            }`;

        const aiReport = await aiService(prompt);

        /* onsole.log("AI REPORT:", aiReport); */

        const result = await InterviewQuestions.findOneAndUpdate(
            { userId },
            {
                userId,
                role: aiReport.role,
                questionDifficulty: aiReport.questionDifficulty,
                questions: aiReport.questions
            },

            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );
        
        return res.status(200).json({
            success: true,
            message: "Interview questions generated successfully",
            data: result
        });

    } catch (err) {
        console.error("GENERATE INTERVIEW QUESTIONS ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const showInterviewQuestions = async (req, res) => {
    try {
        const interviewQuestions = await InterviewQuestions.findOne({
            userId: req.userId
        });

        if (!interviewQuestions) {
            return res.status(404).json({
                success: false,
                message: "No questions found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully Retrieved",
            data: interviewQuestions
        });

    } catch (err) {
        console.log(err.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};