import express from "express";
import {
    uploadResume,
    generateResumeAnalysis,
    getAnalysis,
    getResumeStatus,
    getUserResume,
    deleteUserResume
} from "../controller/resume-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import upload from "../middleware/uploadResume.js";
import extractResumeText from "../middleware/extractResumeText.js";

const router = express.Router();

router.get("/resume", authenticateUser, getUserResume);
router.post("/resume/upload", authenticateUser, upload.single("resume"), uploadResume);
router.delete("/resume", authenticateUser, deleteUserResume);
router.post("/resume/analyze", authenticateUser, extractResumeText, generateResumeAnalysis);
router.get("/resume/status", authenticateUser, getResumeStatus);
router.get("/resume/analysis", authenticateUser, getAnalysis);

export default router;