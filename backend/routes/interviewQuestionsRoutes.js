import express from "express"
import { generateInterviewQuestions ,showInterviewQuestions} from "../controller/interviewQuestion-cltr.js"
import authenticateUser from "../middleware/authentication.js"

const router = express.Router()

router.post('/interview-question/generate',authenticateUser,generateInterviewQuestions)
router.get('/interview-questions',authenticateUser,showInterviewQuestions)


export default router