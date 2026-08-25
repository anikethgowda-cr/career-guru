import express from "express";
import authenticateUser from "../middleware/authentication.js";
import { generateCoursePlan,showCoursePlan } from "../controller/coursePlan-cltr.js";

const router = express.Router();

router.post("/course-plan/generate",authenticateUser,generateCoursePlan);
router.get('/course-plan',authenticateUser,showCoursePlan)

export default router;