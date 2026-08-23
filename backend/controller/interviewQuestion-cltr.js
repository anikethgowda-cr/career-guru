import InterviewQuestions from "../models/interviewQuestionsSchema.js";
import UserProfile from "../models/userProfileSchema.js";
import aiService from "../services/aiServices.js";


export const generateInterviewQuestions=async(req,res)=>{
    const userId=req.userId
    //console.log(userId)
    const {questionDifficulty}=req.body
    
    //console.log(questionDifficulty)
    try{
        if(!questionDifficulty){
            return res.status(400).json({
                success:false,
                error:"please provider the questions difficulties"
            })
        }
        

        const userRecord= await UserProfile.findOne({userId})
        if(!userRecord){
            return res.status(404).json({
                success:false,
                error:"user not found"
            })
        }

        const role =userRecord.preferredJobRole
        const prompt = `You are an expert technical interviewer.

            Generate interview questions for a candidate interested in these roles:
            ${role}

            Difficulty level: "${questionDifficulty}"

            Generate approx (20-45) interview questions.

            Requirements:
            - Questions must be relevant to the candidate's preferred roles.
            - Questions must match the requested difficulty level.
            - Focus on technical and role-specific knowledge.
            - Do not provide answers or explanations.
            - Return ONLY valid JSON.
            - The questions field can be  approx(20-45) strings.

            Return this structure:

            {
            "role": "${role}",
            "questionDifficulty": "${questionDifficulty}",
            "questions": [
                "Question 1",
                "Question 2",
                "Question 3",
                "Question 4",
                "Question 5",
                "Question 6",
                "Question 7",
                "Question 8",
                "Question 9",
                "Question 10"
            ]
            }`

        const aiReport =await aiService(prompt)
        console.log(aiReport)

        const result = await InterviewQuestions.create({
            userId,role:aiReport.role,questionDifficulty:aiReport.questionDifficulty,questions:aiReport.questions
        })
        return res.status(201).json({
            success:true,
            data:result
        })

    }catch(err){
        console.log(err.message)
        return res.status(500).json({error:err.message})
    }
}

export const showInterviewQuestions =async(req,res)=>{
    try{
        const interviewQuestions =await InterviewQuestions.findOne({userId:req.userId})
        
        if(!interviewQuestions){
            return res.status(400).json({
                success:false,error:"no question found"
            })
        }
        return res.status(200).json({
            success:true,
            data:interviewQuestions,    
        })
    }catch(err){
        console.log(err.message)
        return res.status(500).json({
            success:false,
            error:err.message
        })
    }
}