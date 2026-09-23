import axios from "axios";
import { PDFParse } from "pdf-parse";
import Resume from "../models/resumeSchema.js";
import User from "../models/userSchema.js";

const extractResumeText = async (req, res, next) => {
    let parser = null;

    try {
        const resume = await Resume.findOne({
            userId: req.userId
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Resume not found"
            });
        }

        const userDetail = await User.findOne({
            _id: req.userId
        });

        if (!userDetail) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const response = await axios.get(resume.filePath, {
            responseType: "arraybuffer"
        });

        const pdfBuffer = Buffer.from(response.data);

        parser = new PDFParse({ data: pdfBuffer });

        const result = await parser.getText();

        const resumeText = (result.text || "").trim();

        if (!resumeText) {
            return res.status(422).json({
                success: false,
                message: "Could not extract text from your resume PDF. Please upload a text-based (non-scanned) PDF."
            });
        }

        req.resumeText = resumeText;
        req.resumeData = resume;

        next();

    } catch (error) {
        console.error("PDF EXTRACTION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process resume. Please try again."
        });
    } finally {
        // Always release parser resources regardless of success or failure
        if (parser) {
            try {
                await parser.destroy();
            } catch (_) {
                // Ignore cleanup errors
            }
        }
    }
};

export default extractResumeText;