import express from "express";
import {uploadResume,generateResumeAnalysis,getAnalysis} from "../controller/resume-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import upload from "../middleware/uploadResume.js";
import extractResumeText from "../middleware/extractResumeText.js";

const router = express.Router();

router.post("/resume/upload", authenticateUser, upload.single("resume"), uploadResume);
router.post("/resume/analyze", authenticateUser, extractResumeText, generateResumeAnalysis);
router.get("/resume/analysis", authenticateUser, getAnalysis);

export default router;