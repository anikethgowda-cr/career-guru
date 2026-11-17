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
import authorizeRoles from "../middleware/authorizeRoles.js";
import upload from "../middleware/uploadResume.js";
import extractResumeText from "../middleware/extractResumeText.js";

const router = express.Router();

router.get("/resume", authenticateUser, authorizeRoles("user"), getUserResume);
router.post("/resume/upload", authenticateUser, authorizeRoles("user"), upload.single("resume"), uploadResume);
router.delete("/resume", authenticateUser, authorizeRoles("user"), deleteUserResume);
router.post("/resume/analyze", authenticateUser, authorizeRoles("user"), extractResumeText, generateResumeAnalysis);
router.get("/resume/status", authenticateUser, authorizeRoles("user"), getResumeStatus);
router.get("/resume/analysis", authenticateUser, authorizeRoles("user"), getAnalysis);

export default router;