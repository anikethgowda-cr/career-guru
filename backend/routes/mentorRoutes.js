import express from "express"
import { mentorRegister, mentorLogin, deleteMentor,createMentorProfile,showMentorProfile, showMentors,getCurrentMentor} from "../controller/mentor-cltr.js"
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

export default mentorRouter