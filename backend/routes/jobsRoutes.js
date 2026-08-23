import express from "express"
import { getJobsLinks } from "../controller/jobs-cltr.js"
import authenticateUser from "../middleware/authentication.js"

const router=express.Router()

router.get("/jobs",authenticateUser,getJobsLinks)

export default router