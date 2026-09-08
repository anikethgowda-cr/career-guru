import express from "express"
import { mentorRegister, mentorLogin, deleteMentor, createMentorProfile, showMentorProfile, showMentors, getCurrentMentor, getMentees, getMentorDashboardData, updateMentorAvailability } from "../controller/mentor-cltr.js"
import authenticateUser from "../middleware/authentication.js"
import authenticateMentor from "../middleware/authenticateMentor.js"

const mentorRouter = express.Router()

mentorRouter.post("/mentor/register", mentorRegister) 
mentorRouter.post("/mentor/login", mentorLogin) 
mentorRouter.get("/mentors",authenticateUser,showMentors)
mentorRouter.get("/mentor/me",authenticateUser, authenticateMentor,getCurrentMentor)
mentorRouter.delete("/mentor/delete", authenticateUser, authenticateMentor,deleteMentor)

//-------------------------------------------------------------------------------------

mentorRouter.post("/mentor/profile",authenticateUser, authenticateMentor,createMentorProfile)
mentorRouter.get("/mentor/profile", authenticateUser, authenticateMentor, showMentorProfile)
mentorRouter.get("/mentor/mentees", authenticateUser, authenticateMentor, getMentees)
mentorRouter.get("/mentor/dashboard", authenticateUser, authenticateMentor, getMentorDashboardData)
mentorRouter.patch("/mentor/availability", authenticateUser, authenticateMentor, updateMentorAvailability)

export default mentorRouter