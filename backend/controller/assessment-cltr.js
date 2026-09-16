import Assessment from "../models/assessmentSchema.js";
import AssessmentAttempt from "../models/assessmentAttemptSchema.js";
import AssessmentReport from "../models/assessmentReportSchema.js";
import aiService from "../services/aiServices.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export const createManualAssessment = async(req,res)=>{
    try{
        const {studentId,title,difficulty,questions,targetRole} = req.body

        if (!studentId || !title || !difficulty || !questions.length || !targetRole){
            return res.status(400).json({
                success:false,
                message:"please fill the form details properly"
            })
        }

        const createAssessment = await Assessment.create({
            studentId,
            mentorId:req.userId,
            targetRole,
            title,
            difficulty,
            questions
        })

        await AssessmentAttempt.create({
            studentId,
            assessmentId: createAssessment._id,
            responses: [],
            status: "pending"
        })

        return res.status(200).json({
            success:true,
            message:"Assessment created successfully",
            data:createAssessment
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"Interval Server Error"
        })
    }
}


export const generateAiQuestions = async(req,res)=>{
    try {
        const { difficulty, title, targetRole, noOfQuestions } = req.body

        if (!difficulty || !title || !targetRole || !noOfQuestions) {
            return res.status(400).json({
                success:false,
                message:"Please fill all the assessment details properly"
            })
        }

        const prompt = `
            You are an expert technical interviewer.

            Create an interview assessment based on the following details:

            Target Role: ${targetRole}
            Assessment Title: ${title}
            Difficulty: ${difficulty}
            Number of Questions: ${noOfQuestions}

            Instructions:
            1. The FIRST question MUST ALWAYS be "Tell me about yourself."
            2. Generate exactly ${noOfQuestions} questions in total.
            3. The remaining questions must be relevant to the target role.
            4. Questions must match the requested difficulty level.
            5. Questions should be relevant to the assessment title.
            6. Include technical, conceptual, practical, and role-specific questions where appropriate.
            7. Do not generate duplicate questions.
            8. Return the questions as a JSON array.
            9. Every array element must be an object.
            10. Every object must contain only one key: "question".
            11. The value of "question" must contain the actual interview question.
            12. Do not include numbering.
            13. Do not include explanations.
            14. Do not include markdown.
            15. Return ONLY the JSON array.

            Required format:
            [
                {
                    "question": "Tell me about yourself."
                },
                {
                    "question": "Another interview question"
                }
            ]
        `

        const questions = await aiService(prompt)

        if (!Array.isArray(questions)) {
            return res.status(500).json({
                success:false,
                message:"AI generated an invalid question format"
            })
        }

        if (questions.length !== Number(noOfQuestions)) {
            return res.status(500).json({
                success:false,
                message:"AI generated an incorrect number of questions"
            })
        }

        const isValidQuestions = questions.every((item)=>{
            return item &&
                typeof item.question === "string" &&
                item.question.trim()
        })

        if (!isValidQuestions) {
            return res.status(500).json({
                success:false,
                message:"AI generated an invalid question format"
            })
        }

        return res.status(200).json({
            success:true,
            message:"successfully generated questions",
            data:questions
        })

    }catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const createAiAssessment = async(req,res)=>{
    try {
        const {studentId,title,difficulty,questions,targetRole} = req.body

        if (!studentId || !title || !difficulty || !questions?.length || !targetRole) {
            return res.status(400).json({
                success:false,
                message:"Please fill all the assessment details properly"
            })
        }

        const createAssessment = await Assessment.create({
            studentId,
            mentorId:req.userId,
            targetRole,
            title,
            difficulty,
            questions
        })

        await AssessmentAttempt.create({
            studentId,
            assessmentId: createAssessment._id,
            responses: [],
            status: "pending"
        })

        return res.status(201).json({
            success:true,
            message:"AI assessment created successfully",
            data:createAssessment
        })

    }catch(err){
        console.log(err)

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const getStudentsAssessments = async(req,res)=>{
    try{
        const userId = req.userId

        const assessment = await Assessment.find({
            studentId:userId
        })
        .populate("studentId","username")
        .populate("mentorId","username")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success:true,
            message:"Assessments Found",
            data:assessment || []
        })

    }catch(err){
        console.log(err)

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const createAssessmentAttempt = async(req,res)=>{
    try {
        const userId = req.userId
        const {assessmentId} = req.body

        const assessmentDetails = await Assessment.findById(assessmentId)

        if(!assessmentDetails){
            return res.status(404).json({
                success:false,
                message:"Assessment Not Found"
            })
        }

        if(String(assessmentDetails.studentId) !== String(userId)){
            return res.status(403).json({
                success:false,
                message:"Assessment Does Not Belong To This User"
            })
        }

        const existingAttempt = await AssessmentAttempt.findOne({
            studentId: userId,
            assessmentId
        })

        if (existingAttempt) {
            if (existingAttempt.status === "completed") {
                return res.status(400).json({
                    success: false,
                    message: "Assessment already completed"
                })
            }

            if (existingAttempt.status === "pending") {
                existingAttempt.status = "in-progress"
                await existingAttempt.save()
            }

            return res.status(200).json({
                success: true,
                message: "Existing Assessment Attempt Found",
                data: existingAttempt
            })
        }

        const assessmentAttempt = await AssessmentAttempt.create({
            studentId: userId,
            assessmentId,
            responses: [],
            status: "in-progress"
        })

        return res.status(201).json({
            success: true,
            message: "Assessment Attempt Created",
            data: assessmentAttempt
        })

    }catch(err){
        console.log(err)

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const getAssessmentById = async(req,res)=>{
    try {
        const userId = req.userId
        const {assessmentId} = req.params

        const assessment = await Assessment.findById(assessmentId)
            .populate("studentId","username")
            .populate("mentorId","username")

        if(!assessment){
            return res.status(404).json({
                success:false,
                message:"Assessment Not Found"
            })
        }

        if(String(assessment.studentId._id) !== String(userId)){
            return res.status(403).json({
                success:false,
                message:"You are not allowed to access this assessment"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Assessment Found",
            data:assessment
        })

    }catch(err){
        console.log(err)

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}



export const submitAssessment = async(req,res)=>{
    try {
        const userId = req.userId
        const {attemptId,responses} = req.body

        if(!attemptId){
            return res.status(400).json({
                success:false,
                message:"Assessment attempt ID is required"
            })
        }

        const attempt = await AssessmentAttempt.findById(attemptId)

        if(!attempt){
            return res.status(404).json({
                success:false,
                message:"Assessment Attempt Not Found"
            })
        }

        if(String(attempt.studentId) !== String(userId)){
            return res.status(403).json({
                success:false,
                message:"You are not allowed to submit this assessment"
            })
        }

        if(attempt.status !== "in-progress"){
            return res.status(400).json({
                success:false,
                message:"Assessment has already been submitted"
            })
        }

        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"Interview video is required"
            })
        }

        let parsedResponses = []

        if(responses){
            try {
                parsedResponses = JSON.parse(responses)
            }catch(err){
                return res.status(400).json({
                    success:false,
                    message:"Invalid responses format"
                })
            }
        }

        if(!Array.isArray(parsedResponses)){
            return res.status(400).json({
                success:false,
                message:"Responses must be an array"
            })
        }

        console.log("Interview video received successfully")
        console.log("Video size:",req.file.size)
        console.log("Video type:",req.file.mimetype)
        console.log("Video name:",req.file.originalname)
        console.log("Responses received:",parsedResponses)

        // Save responses
        attempt.responses = parsedResponses

        // Upload video to Cloudinary using chunked streaming to avoid timeout
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "careerguru/interviews",
                    resource_type: "video",
                    chunk_size: 6 * 1024 * 1024, // 6 MB chunks
                    timeout: 120000              // 120 seconds per chunk
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            // Convert buffer to readable stream and pipe — prevents single-shot timeout
            const readableStream = new Readable();
            readableStream.push(req.file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });

        console.log("Cloudinary upload successful")
        console.log("Cloudinary URL:",uploadResult.secure_url)
        console.log("Cloudinary Public ID:",uploadResult.public_id)

        // Save Cloudinary details
        attempt.videoURL = uploadResult.secure_url
        attempt.videoPublicId = uploadResult.public_id

        // Change attempt status after successful upload
        attempt.status = "completed"

        await attempt.save()

        // Also mark the parent Assessment as completed
        await Assessment.findByIdAndUpdate(attempt.assessmentId, {
            status: "completed"
        })

        return res.status(200).json({
            success:true,
            message:"Assessment Submitted Successfully",
            data:attempt
        })

    }catch(err){
        console.log("Assessment Submit Error:",err)

        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getMentorAssessments = async (req, res) => {
    try {
        const mentorId = req.userId;

        const assessments = await Assessment.find({
            mentorId
        })
            .populate("studentId", "username email")
            .populate("mentorId", "username email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Mentor assessments found",
            data: assessments
        });
    } catch (err) {
        console.log("Get Mentor Assessments Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getAssessmentReport = async (req, res) => {
    try {
        const userId = req.userId;
        const { assessmentId } = req.params;

        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID is required"
            });
        }

        const assessment = await Assessment.findById(assessmentId)
            .populate("studentId", "username email")
            .populate("mentorId", "username email");

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment Not Found"
            });
        }

        // Validate access: must be the student or mentor of this assessment
        const studentUserId = String(assessment.studentId?._id || assessment.studentId);
        const mentorUserId = String(assessment.mentorId?._id || assessment.mentorId);

        if (studentUserId !== String(userId) && mentorUserId !== String(userId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this report"
            });
        }

        // 1. Check if report already exists in DB
        const existingReport = await AssessmentReport.findOne({ assessmentId })
            .populate("studentId", "username email")
            .populate("mentorId", "username email")
            .populate("assessmentId", "title targetRole difficulty questions status");

        if (existingReport) {
            return res.status(200).json({
                success: true,
                message: "Assessment report fetched from database",
                data: existingReport
            });
        }

        // 2. Report not in DB -> Check completed attempt
        const attempt = await AssessmentAttempt.findOne({
            assessmentId,
            status: "completed"
        });

        if (!attempt) {
            return res.status(400).json({
                success: false,
                message: "Assessment has not been completed yet."
            });
        }

        const responses = attempt.responses || [];
        if (!responses.length) {
            return res.status(400).json({
                success: false,
                message: "No question responses found for this assessment."
            });
        }

        // 3. Generate AI report based on question and speech transcript (no video)
        const prompt = `
You are an expert technical interviewer and hiring evaluator.
Analyze the candidate's interview responses for each question and provide an overall assessment report.
Evaluation must be based ONLY on the question text and candidate's transcribed answers provided below.

Assessment Context:
- Target Role: ${assessment.targetRole}
- Assessment Title: ${assessment.title}
- Difficulty Level: ${assessment.difficulty}

Questions and Candidate Transcripts:
${JSON.stringify(
    responses.map((r, i) => ({
        questionIndex: i + 1,
        questionId: String(r.questionId),
        question: r.question,
        transcript: r.transcript ? r.transcript.trim() : "No answer spoken or recorded"
    })),
    null,
    2
)}

Instructions:
1. For EACH question:
   - score: Rating from 1 to 10 based on relevance, technical accuracy, clarity, and depth. (Give 1-3 if transcript is empty, incoherent, or missing).
   - feedback: 2-3 constructive sentences detailing what was good and what was lacking.
   - strengths: Array of 1-3 bullet points highlighting positive elements.
   - improvements: Array of 1-3 bullet points highlighting clear improvement points.
   - idealAnswer: A concise summary paragraph of what a strong, ideal answer for this question should cover.
2. For OVERALL performance:
   - overallScore: Integer from 0 to 100 (weighted aggregate of question scores).
   - technicalScore: Integer from 0 to 100 representing technical knowledge demonstrated.
   - communicationScore: Integer from 0 to 100 representing clarity and articulation.
   - overallSummary: A comprehensive 3-5 sentence executive summary of the candidate's interview performance against the target role of ${assessment.targetRole}.
   - strengths: Array of 3-5 high-level strengths observed across the whole interview.
   - areasForImprovement: Array of 3-5 actionable recommendations for the candidate.
   - finalRecommendation: Strictly one of: "Strong Hire", "Hire", "Needs Practice", "Not Ready".

Return ONLY a valid JSON object strictly matching this format:
{
    "overallReport": {
        "overallScore": 82,
        "technicalScore": 80,
        "communicationScore": 85,
        "overallSummary": "...",
        "strengths": ["...", "..."],
        "areasForImprovement": ["...", "..."],
        "finalRecommendation": "Hire"
    },
    "questionAnalysis": [
        {
            "questionId": "...",
            "question": "...",
            "transcript": "...",
            "score": 8,
            "feedback": "...",
            "strengths": ["..."],
            "improvements": ["..."],
            "idealAnswer": "..."
        }
    ]
}
`;

        console.log("Generating AI assessment report for assessment:", assessmentId);
        const aiResult = await aiService(prompt);

        if (!aiResult || !aiResult.overallReport) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate AI evaluation report"
            });
        }

        // Align questionId properly with original responses
        const formattedQuestionAnalysis = (aiResult.questionAnalysis || []).map((qAnalysis, index) => {
            const original = responses[index] || {};
            return {
                questionId: original.questionId || qAnalysis.questionId,
                question: original.question || qAnalysis.question,
                transcript: original.transcript || qAnalysis.transcript || "",
                score: typeof qAnalysis.score === "number" ? qAnalysis.score : 0,
                feedback: qAnalysis.feedback || "",
                strengths: Array.isArray(qAnalysis.strengths) ? qAnalysis.strengths : [],
                improvements: Array.isArray(qAnalysis.improvements) ? qAnalysis.improvements : [],
                idealAnswer: qAnalysis.idealAnswer || ""
            };
        });

        // 4. Save the generated report to MongoDB
        const newReport = await AssessmentReport.create({
            assessmentId: assessment._id,
            attemptId: attempt._id,
            studentId: assessment.studentId._id || assessment.studentId,
            mentorId: assessment.mentorId._id || assessment.mentorId,
            targetRole: assessment.targetRole,
            videoURL: attempt.videoURL || "",
            overallReport: {
                overallScore: aiResult.overallReport.overallScore || 0,
                technicalScore: aiResult.overallReport.technicalScore || 0,
                communicationScore: aiResult.overallReport.communicationScore || 0,
                overallSummary: aiResult.overallReport.overallSummary || "",
                strengths: Array.isArray(aiResult.overallReport.strengths) ? aiResult.overallReport.strengths : [],
                areasForImprovement: Array.isArray(aiResult.overallReport.areasForImprovement) ? aiResult.overallReport.areasForImprovement : [],
                finalRecommendation: aiResult.overallReport.finalRecommendation || "Needs Practice"
            },
            questionAnalysis: formattedQuestionAnalysis
        });

        // Update overall score in attempt
        attempt.overAllScore = newReport.overallReport.overallScore;
        await attempt.save();

        const populatedReport = await AssessmentReport.findById(newReport._id)
            .populate("studentId", "username email")
            .populate("mentorId", "username email")
            .populate("assessmentId", "title targetRole difficulty questions status");

        console.log("AI assessment report saved to DB successfully:", newReport._id);

        return res.status(201).json({
            success: true,
            message: "Assessment report generated and saved successfully",
            data: populatedReport
        });

    } catch (err) {
        console.log("Get/Generate Assessment Report Error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};

export const deleteAssessment = async (req, res) => {
    try {
        const mentorId = req.userId;
        const { assessmentId } = req.params;

        if (!assessmentId) {
            return res.status(400).json({
                success: false,
                message: "Assessment ID is required"
            });
        }

        const assessment = await Assessment.findById(assessmentId);

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        // Verify that this mentor owns the assessment
        if (String(assessment.mentorId) !== String(mentorId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this assessment"
            });
        }

        // Remove associated attempts and reports if any
        await AssessmentAttempt.deleteMany({ assessmentId });
        await AssessmentReport.deleteMany({ assessmentId });

        // Delete the assessment
        await Assessment.findByIdAndDelete(assessmentId);

        return res.status(200).json({
            success: true,
            message: "Assessment deleted successfully",
            data: { assessmentId }
        });
    } catch (err) {
        console.log("Delete Assessment Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
