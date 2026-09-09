import axios from "axios";
import { PDFParse } from "pdf-parse";
import Resume from "../models/resumeSchema.js";
import User from "../models/userSchema.js";

const extractResumeText = async (req, res, next) => {
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

        const parser = new PDFParse({
            data: pdfBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        req.resumeText = result.text;
        req.resumeData = resume;

        next();

    } catch (error) {
        console.error("PDF EXTRACTION ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default extractResumeText;