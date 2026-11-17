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
import authorizeRoles from "../middleware/authorizeRoles.js"

const assessmentRouter = express.Router()

assessmentRouter.post("/assessment/manual", authenticateUser, authorizeRoles("mentor"), createManualAssessment)
assessmentRouter.post("/assessment/aiQuestions", authenticateUser, authorizeRoles("mentor"), generateAiQuestions)
assessmentRouter.post("/assessment/ai", authenticateUser, authorizeRoles("mentor"), createAiAssessment)
assessmentRouter.get("/assessments", authenticateUser, authorizeRoles("user"), getStudentsAssessments)
assessmentRouter.get("/assessment/mentor/all", authenticateUser, authorizeRoles("mentor"), getMentorAssessments)
assessmentRouter.get("/assessment/report/:assessmentId", authenticateUser, authorizeRoles("user", "mentor"), getAssessmentReport)
assessmentRouter.delete("/assessment/:assessmentId", authenticateUser, authorizeRoles("mentor"), deleteAssessment)
assessmentRouter.post("/assessment/attempt", authenticateUser, authorizeRoles("user"), createAssessmentAttempt)
assessmentRouter.post("/assessment/submit", authenticateUser, authorizeRoles("user"), submitAssessment);
assessmentRouter.get("/assessment/:assessmentId", authenticateUser, authorizeRoles("user", "mentor"), getAssessmentById);

export default assessmentRouter