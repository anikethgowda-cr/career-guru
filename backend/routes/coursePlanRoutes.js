import express from "express";
import authenticateUser from "../middleware/authentication.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";
import { generateCoursePlan, showCoursePlan } from "../controller/coursePlan-cltr.js";

const router = express.Router();

router.post("/course-plan/generate", authenticateUser, authorizeRoles("user"), aiRateLimiter, generateCoursePlan);
router.get("/course-plan", authenticateUser, authorizeRoles("user"), showCoursePlan);

export default router;