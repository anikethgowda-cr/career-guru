import Assessment from "../models/assessmentSchema.js";
import AssessmentAttempt from "../models/assessmentAttemptSchema.js";
import aiService from "../services/aiServices.js";
import cloudinary from "../config/cloudinary.js";

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

        if(!assessment.length){
            return res.status(404).json({
                success:false,
                message:"No Assessment Found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Assessments Found",
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

        // Upload video to Cloudinary
        const uploadResult = await new Promise((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder:"careerguru/interviews",
                    resource_type:"video"
                },
                (error,result)=>{
                    if(error){
                        reject(error)
                    }else{
                        resolve(result)
                    }
                }
            )

            uploadStream.end(req.file.buffer)
        })

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


