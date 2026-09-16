import express from "express"
import {createManualAssessment,
        generateAiQuestions,
        createAiAssessment,
        getStudentsAssessments,
        createAssessmentAttempt,
        getAssessmentById,
        submitAssessment,
        getMentorAssessments,
        getAssessmentReport,
        deleteAssessment
} from "../controller/assessment-cltr.js"
import authenticateUser from "../middleware/authentication.js"
import authenticateMentor from "../middleware/authenticateMentor.js"
import assessmentUpload from "../middleware/assessmentUpload.js";

const assessmentRouter = express.Router()

assessmentRouter.post("/assessment/manual",authenticateUser,authenticateMentor,createManualAssessment)
assessmentRouter.post("/assessment/aiQuestions",authenticateUser,authenticateMentor,generateAiQuestions)
assessmentRouter.post("/assessment/ai",authenticateUser,authenticateMentor,createAiAssessment)
assessmentRouter.get("/assessments",authenticateUser,getStudentsAssessments)
assessmentRouter.get("/assessment/mentor/all", authenticateUser, authenticateMentor, getMentorAssessments)
assessmentRouter.get("/assessment/report/:assessmentId", authenticateUser, getAssessmentReport)
assessmentRouter.delete("/assessment/:assessmentId", authenticateUser, authenticateMentor, deleteAssessment)
assessmentRouter.post("/assessment/attempt",authenticateUser,createAssessmentAttempt)
assessmentRouter.post("/assessment/submit", authenticateUser, assessmentUpload.single("video"), submitAssessment);
assessmentRouter.get("/assessment/:assessmentId", authenticateUser, getAssessmentById);

export default assessmentRouter