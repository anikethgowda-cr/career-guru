import express from "express"
import { mentorRegister, mentorLogin, deleteMentor,createMentorProfile,showMentorProfile} from "../controller/mentor-cltr.js"
import authenticateUser from "../middleware/authentication.js"

const mentorRouter = express.Router()

mentorRouter.post("/mentor/register", mentorRegister) 
mentorRouter.post("/mentor/login", mentorLogin) 
mentorRouter.delete("/mentor/delete", authenticateUser, deleteMentor)

//-------------------------------------------------------------------------------------

mentorRouter.post("/mentor/profile",authenticateUser,createMentorProfile)
mentorRouter.get("/mentor/profile", authenticateUser, showMentorProfile)

export default mentorRouter