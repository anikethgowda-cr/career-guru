import express from "express"
import { mentorRegister, mentorLogin, mentorProfile, deleteMentor } from "../controller/mentor-cltr.js"
import authenticateUser from "../middleware/authentication.js"

const mentorRouter = express.Router()

mentorRouter.post("/mentor/register", mentorRegister) 
mentorRouter.post("/mentor/login", mentorLogin) 
mentorRouter.get("/mentor/profile", authenticateUser, mentorProfile)
mentorRouter.delete("/mentor/delete", authenticateUser, deleteMentor)

export default mentorRouter