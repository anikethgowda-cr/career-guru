import express from "express"
import { createMentorPlan, getMentorPlan, updateMentorPlan, getMentorPlanByMentorId } from "../controller/mentorshipPlan-cltr.js"
import authenticateUser from "../middleware/authentication.js"
import authorizeRoles from "../middleware/authorizeRoles.js"

const mentorPlanRouter = express.Router()

mentorPlanRouter.post("/mentor-plan", authenticateUser, authorizeRoles("mentor"), createMentorPlan)
mentorPlanRouter.get("/mentor-plan", authenticateUser, authorizeRoles("mentor"), getMentorPlan)
mentorPlanRouter.put("/mentor-plan", authenticateUser, authorizeRoles("mentor"), updateMentorPlan)
// Public: students can view a mentor's plan pricing before subscribing
mentorPlanRouter.get("/mentor-plan/:mentorId", authenticateUser, getMentorPlanByMentorId)

export default mentorPlanRouter