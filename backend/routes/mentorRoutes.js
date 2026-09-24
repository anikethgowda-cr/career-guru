import express from "express"
import { mentorRegister, mentorLogin, deleteMentor, createMentorProfile, showMentorProfile, showMentors, getMentorById, getCurrentMentor, getMentees, getMentorDashboardData, updateMentorAvailability ,createMentorReport  } from "../controller/mentor-cltr.js"
import authenticateUser from "../middleware/authentication.js"
import authorizeRoles from "../middleware/authorizeRoles.js"

const mentorRouter = express.Router()

mentorRouter.post("/mentor/register", mentorRegister) 
mentorRouter.post("/mentor/login", mentorLogin) 
mentorRouter.get("/mentors", authenticateUser, authorizeRoles("user", "mentor"), showMentors)
mentorRouter.get("/mentors/:mentorId", authenticateUser, getMentorById)
mentorRouter.get("/mentor/me", authenticateUser, authorizeRoles("mentor"), getCurrentMentor)
mentorRouter.delete("/mentor/delete", authenticateUser, authorizeRoles("mentor"), deleteMentor)

//-------------------------------------------------------------------------------------

mentorRouter.post("/mentor/profile", authenticateUser, authorizeRoles("mentor"), createMentorProfile)
mentorRouter.get("/mentor/profile", authenticateUser, authorizeRoles("mentor"), showMentorProfile)
mentorRouter.get("/mentor/mentees", authenticateUser, authorizeRoles("mentor"), getMentees)
mentorRouter.get("/mentor/dashboard", authenticateUser, authorizeRoles("mentor"), getMentorDashboardData)
mentorRouter.post("/mentor/userReport/:studentId", authenticateUser, authorizeRoles("mentor"), createMentorReport)
mentorRouter.patch("/mentor/availability", authenticateUser, authorizeRoles("mentor"), updateMentorAvailability)

export default mentorRouter

