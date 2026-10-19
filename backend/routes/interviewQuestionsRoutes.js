import express from "express"
import { generateInterviewQuestions, showInterviewQuestions } from "../controller/interviewQuestion-cltr.js"
import authenticateUser from "../middleware/authentication.js"
import authorizeRoles from "../middleware/authorizeRoles.js"
import aiRateLimiter from "../middleware/aiRateLimiter.js"

const router = express.Router()

router.post("/interview-questions/generate", authenticateUser, authorizeRoles("user"), aiRateLimiter, generateInterviewQuestions)
router.get("/interview-questions", authenticateUser, authorizeRoles("user"), showInterviewQuestions)

export default router