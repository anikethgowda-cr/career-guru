import express from "express"
import { getJobsLinks } from "../controller/jobs-cltr.js"
import authenticateUser from "../middleware/authentication.js"
import authorizeRoles from "../middleware/authorizeRoles.js"

const router = express.Router()

router.get("/jobs", authenticateUser, authorizeRoles("user"), getJobsLinks)

export default router