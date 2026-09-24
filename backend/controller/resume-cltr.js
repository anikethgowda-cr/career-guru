import fs from "fs/promises";
import Resume from "../models/resumeSchema.js";
import aiService from "../services/aiServices.js";
import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
import CoursePlan from "../models/coursePlanSchema.js";
import InterviewQuestions from "../models/interviewQuestionsSchema.js";
import UserProfile from "../models/userProfileSchema.js";
import cloudinary from "../config/cloudinary.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF"
      });
    }

    const existingResume = await Resume.findOne({
      userId: req.userId
    });

    const filePath = req.file.path || req.file.secure_url || req.file.url;
    const publicId = req.file.filename || req.file.public_id;

    if (existingResume) {
      try {
        await cloudinary.uploader.destroy(existingResume.publicId, {
          resource_type: "raw"
        });
      } catch (err) {
        console.warn("Could not delete old resume from Cloudinary:", err.message);
      }

      existingResume.fileName = req.file.originalname;
      existingResume.filePath = filePath;
      existingResume.publicId = publicId;

      const updatedResume = await existingResume.save();

      // Clear existing downstream learning plan, interview questions, and old analysis
      await CoursePlan.deleteMany({ userId: req.userId });
      await InterviewQuestions.deleteMany({ userId: req.userId });
      await ResumeAnalysis.deleteMany({ userId: req.userId });

      return res.status(200).json({
        success: true,
        message: "Resume updated successfully",
        data: updatedResume
      });
    }

    const resume = await Resume.create({
      userId: req.userId,
      fileName: req.file.originalname,
      filePath: filePath,
      publicId: publicId
    });

    // Clear existing downstream learning plan, interview questions, and old analysis
    await CoursePlan.deleteMany({ userId: req.userId });
    await InterviewQuestions.deleteMany({ userId: req.userId });
    await ResumeAnalysis.deleteMany({ userId: req.userId });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: resume
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const generateResumeAnalysis = async (req, res) => {
    try {
        const userId = req.userId;
        const resumeText = req.resumeText;

        let {
            preferredJobRole,
            preferredSpecialization
        } = req.body || {};

        // Fallback to user profile if not passed in body
        if (!preferredJobRole || !preferredSpecialization || !preferredSpecialization.length) {
            const userProfile = await UserProfile.findOne({ userId });
            if (userProfile) {
                preferredJobRole = preferredJobRole || userProfile.preferredJobRole;
                preferredSpecialization = (preferredSpecialization && preferredSpecialization.length)
                    ? preferredSpecialization
                    : userProfile.preferredSpecialization;
            }
        }

        if (!preferredJobRole) {
            return res.status(400).json({
                success: false,
                message: "Preferred job role is required"
            });
        }

        if (!resumeText) {
            return res.status(400).json({
                success: false,
                message: "Resume text not found"
            });
        }

        const specialization = Array.isArray(preferredSpecialization)
            ? preferredSpecialization.join(", ")
            : (preferredSpecialization || "");

        const prompt = `
              You are an expert ATS resume analyzer and career advisor.

              Analyze the candidate's resume specifically for the candidate's preferred job role and preferred specialization.

              PREFERRED JOB ROLE:
              ${preferredJobRole}

              PREFERRED SPECIALIZATION:
              ${specialization}

              RESUME:
              ${resumeText}

              Analyze the resume based ONLY on:

              1. Preferred Job Role
              2. Preferred Specialization

              Do not consider location, salary, company, or any other personal preference.

              Requirements:

              - Generate an ATS score from 0 to 100.
              - Evaluate how well the resume matches the preferred job role.
              - Evaluate how well the candidate's skills match the preferred specialization.
              - Identify the candidate's strengths relevant to the role and specialization.
              - Identify weaknesses or gaps relevant to the role and specialization.
              - Provide practical suggestions to improve the resume.
              - Identify important skills required for the role and specialization that are missing from the resume.
              - Identify valuable skills already present in the resume that strengthen the candidate's profile.
              - Do not mark a skill as missing if the candidate already has it in the resume.
              - Focus only on skills relevant to the preferred role and specialization.
              - Do not penalize the candidate because of missing location information.
              - Do not invent skills that are not present in the resume.
              - Keep missingSkills and valueAddingSkills as skill/keyword lists.
              - Provide at least 4 strengths.
              - Provide at least 4 weaknesses.
              - Provide 6 suggestions.
              - Return ONLY valid JSON.
              - Do not use markdown.
              - Do not wrap the JSON inside a code block.

              Return exactly this structure:

              {
                  "roleAnalysis": {
                      "role": "${preferredJobRole}",
                      "specialization": "${specialization}",
                      "atsScore": 0,
                      "strengths": [],
                      "weaknesses": [],
                      "suggestions": [],
                      "missingSkills": [],
                      "valueAddingSkills": []
                  }
              }
              `;

        const analysisResult = await aiService(prompt);

        const savedAnalysis = await ResumeAnalysis.findOneAndUpdate(
            {
                userId: userId,
                resumeId: req.resumeData._id
            },
            {
                $set: {
                    roleAnalysis: analysisResult.roleAnalysis
                }
            },
            {
                returnDocument: "after",
                upsert: true,
                runValidators: true
            }
        );

        // Clear downstream learning plans and interview questions so they are regenerated fresh
        await CoursePlan.deleteMany({ userId });
        await InterviewQuestions.deleteMany({ userId });

        return res.status(200).json({
            success: true,
            message: "Resume analyzed successfully",
            data: savedAnalysis
        });

    } catch (err) {
        console.error("RESUME ANALYSIS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const getAnalysis = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ userId: req.userId }).populate("userId", "username");

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "No analysis found",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getResumeStatus = async (req, res) => {
    try {

        const analysis = await ResumeAnalysis.findOne({
            userId: req.userId
        }).select("_id");

        return res.status(200).json({
            success: true,
            hasResumeAnalysis: !!analysis
        });

    } catch (err) {

        console.error("GET USER STATUS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getUserResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.status(200).json({
                success: true,
                hasResume: false,
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            hasResume: true,
            data: resume
        });

    } catch (err) {
        console.error("GET USER RESUME ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const deleteUserResume = async (req, res) => {
    try {
        const resume = await Resume.findOne({ userId: req.userId });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "No resume found to delete"
            });
        }

        // Delete from Cloudinary
        try {
            if (resume.publicId) {
                await cloudinary.uploader.destroy(resume.publicId, {
                    resource_type: "raw"
                });
            }
        } catch (cloudErr) {
            console.warn("Could not delete resume from Cloudinary:", cloudErr.message);
        }

        // Delete Resume document
        await Resume.deleteOne({ userId: req.userId });

        // Delete ResumeAnalysis, CoursePlan, and InterviewQuestions documents
        await ResumeAnalysis.deleteMany({ userId: req.userId });
        await CoursePlan.deleteMany({ userId: req.userId });
        await InterviewQuestions.deleteMany({ userId: req.userId });

        return res.status(200).json({
            success: true,
            message: "Resume and analysis report deleted successfully"
        });

    } catch (err) {
        console.error("DELETE RESUME ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};