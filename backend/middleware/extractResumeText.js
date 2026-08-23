import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import Resume from "../models/resumeSchema.js";
import UserProfile from "../models/userProfileSchema.js";

const extractResumeText = async (req, res, next) => {
  try {
    
    // Find user's resume
    const resume = await Resume.findOne({
      userId: req.userId
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        error: "Resume not found"
      });
    }

    // Find user's profile
    const profile = await UserProfile.findOne({
      userId: req.userId
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "User profile not found"
      });
    }

    // Read permanently stored PDF
    const pdfBuffer = await fs.readFile(resume.filePath);

    // Extract text
    const parser = new PDFParse({
      data: pdfBuffer
    });

    const result = await parser.getText();

    await parser.destroy();

    // Pass temporary data to next controller
    req.resumeText = result.text;
    req.resumeData = resume;
    req.preferredJobRole = profile.preferredJobRole;

    next();

  } catch (error) {
    console.error("PDF EXTRACTION ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export default extractResumeText;