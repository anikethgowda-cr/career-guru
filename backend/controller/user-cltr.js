import User from "../models/userSchema.js";
import UserProfile from "../models/userProfileSchema.js";
import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
import CoursePlan from "../models/coursePlanSchema.js";
import InterviewQuestions from "../models/interviewQuestionsSchema.js";
import Resume from "../models/resumeSchema.js";
import aiService from "../services/aiServices.js";
import axios from "axios";
import { PDFParse } from "pdf-parse";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const userRegister = async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    const existingUsername = await User.findOne({
      username,
      role: "user"
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists for a user"
      });
    }

    const existingEmail = await User.findOne({
      email
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    const saltValue = await bcryptjs.genSalt(10);

    const hashPassword = await bcryptjs.hash(
      password,
      saltValue
    );

    const user = await User.create({
      username,
      email,
      password: hashPassword,
      phone,
      role: "user"
    });

    return res.status(201).json({
      success: true,
      message: "Successfully registered",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Access denied "
            });
        }

        const isVerified = await bcryptjs.compare(
            password,
            user.password
        );

        if (!isVerified) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const tokenData = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(
            tokenData,
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: token
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("username email phone role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (err) {
        console.error("GET CURRENT USER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const deleteUser = async (req, res) => {
  const userId = req.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const createProfile = async (req, res) => {
  const { education, experience, preferredJobRole, preferredSpecialization, preferredLocation, linkedin } = req.body;

  try {
    const existingProfile = await UserProfile.findOne({ userId: req.userId });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Profile already exists"
      });
    }

    const profileDetails = await UserProfile.create({
      userId: req.userId,
      education,
      experience,
      preferredJobRole,
      preferredSpecialization,
      preferredLocation,
      linkedin
    });

    return res.status(201).json({
      success: true,
      message: "Successfully created profile",
      data: profileDetails
      
    });

  } catch (err) {
    console.error("CREATE PROFILE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const showProfile = async (req, res) => {

    const userId = req.userId;

    try {

        const userDetails = await User.findById(userId)
            .select("username email phone role");

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const profileDetails = await UserProfile.findOne({
            userId: userId
        });

        return res.status(200).json({
            success: true,
            hasProfile: !!profileDetails,
            data: {
                user: userDetails,
                profile: profileDetails
            }
        });

    } catch (err) {

        console.error("SHOW PROFILE ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.userId;
    const {
        username,
        phone,
        education,
        experience,
        preferredJobRole,
        preferredSpecialization,
        preferredLocation,
        linkedin
    } = req.body;

    try {
        const existingProfile = await UserProfile.findOne({ userId });

        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found"
            });
        }

        // Detect if preferredJobRole or preferredSpecialization changed
        const currentRole = existingProfile.preferredJobRole || "";
        const newRole = preferredJobRole || currentRole;

        const currentSpecs = Array.isArray(existingProfile.preferredSpecialization)
            ? [...existingProfile.preferredSpecialization].sort()
            : [];
        const newSpecs = Array.isArray(preferredSpecialization)
            ? [...preferredSpecialization].sort()
            : currentSpecs;

        const roleChanged = currentRole !== newRole;
        const specChanged = JSON.stringify(currentSpecs) !== JSON.stringify(newSpecs);
        const careerTargetChanged = roleChanged || specChanged;

        let reanalyzed = false;

        if (careerTargetChanged) {
            // Delete old Learning Plan and Interview Questions
            await CoursePlan.deleteMany({ userId });
            await InterviewQuestions.deleteMany({ userId });
            await ResumeAnalysis.deleteMany({ userId });

            // Check if user has uploaded resume in database
            const userResume = await Resume.findOne({ userId });

            if (userResume && userResume.filePath) {
                try {
                    const response = await axios.get(userResume.filePath, {
                        responseType: "arraybuffer"
                    });
                    const parser = new PDFParse({ data: Buffer.from(response.data) });
                    const parsed = await parser.getText();
                    await parser.destroy();

                    const resumeText = parsed.text;
                    const specString = newSpecs.join(", ");

                    const prompt = `
              You are an expert ATS resume analyzer and career advisor.

              Analyze the candidate's resume specifically for the candidate's preferred job role and preferred specialization.

              PREFERRED JOB ROLE:
              ${newRole}

              PREFERRED SPECIALIZATION:
              ${specString}

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
              - Provide at least 4 suggestions.
              - Return ONLY valid JSON.
              - Do not use markdown.
              - Do not wrap the JSON inside a code block.

              Return exactly this structure:

              {
                  "roleAnalysis": {
                      "role": "${newRole}",
                      "specialization": "${specString}",
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

                    await ResumeAnalysis.create({
                        userId,
                        resumeId: userResume._id,
                        roleAnalysis: analysisResult.roleAnalysis
                    });

                    reanalyzed = true;
                } catch (aiErr) {
                    console.error("AUTO RE-ANALYSIS ERROR ON PROFILE UPDATE:", aiErr.message);
                }
            }
        }

        // Update profile fields
        if (education !== undefined) existingProfile.education = education;
        if (experience !== undefined) existingProfile.experience = Number(experience);
        if (preferredJobRole !== undefined) existingProfile.preferredJobRole = preferredJobRole;
        if (preferredSpecialization !== undefined) existingProfile.preferredSpecialization = preferredSpecialization;
        if (preferredLocation !== undefined) existingProfile.preferredLocation = preferredLocation;
        if (linkedin !== undefined) existingProfile.linkedin = linkedin;

        const updatedProfile = await existingProfile.save();

        // Update User account fields if changed
        const user = await User.findById(userId);
        if (user) {
            if (phone !== undefined) user.phone = phone;
            if (username && username.trim() && username !== user.username) {
                const usernameConflict = await User.findOne({
                    username,
                    role: "user",
                    _id: { $ne: userId }
                });
                if (!usernameConflict) {
                    user.username = username;
                }
            }
            await user.save();
        }

        const userDetails = await User.findById(userId).select("username email phone role");

        return res.status(200).json({
            success: true,
            message: careerTargetChanged
                ? (reanalyzed
                    ? "Profile updated. Career targets changed: old learning plan and interview questions were reset, and a new Resume Analysis was generated on the fly."
                    : "Profile updated. Career targets changed: old learning plan and interview questions were reset. Please upload a resume to calculate ATS analysis.")
                : "Profile updated successfully.",
            careerTargetChanged,
            reanalyzed,
            data: {
                user: userDetails,
                profile: updatedProfile
            }
        });

    } catch (err) {
        console.error("UPDATE PROFILE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};