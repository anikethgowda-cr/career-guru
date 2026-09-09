import User from "../models/userSchema.js";
import MentorProfile from "../models/mentorProfileSchema.js";
import UserProfile from "../models/userProfileSchema.js";
import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
import MentorReport from "../models/mentorReportSchema.js";
import Conversation from "../models/conversationSchema.js";
import Message from "../models/messageSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import aiService from "../services/aiServices.js";


export const mentorRegister = async (req, res) => {
  const { username, email, password, phone } = req.body;

  try {
    const existingUsername = await User.findOne({
      username,
      role: "mentor"
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists for a mentor"
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
      role: "mentor"
    });

    return res.status(201).json({
      success: true,
      message: "Mentor registered successfully",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (err) {
    console.error("MENTOR REGISTER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const mentorLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        if (user.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
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
            message: "Mentor login successful",
            token: token
        });

    } catch (err) {
        console.error("Mentor login error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const getCurrentMentor = async (req, res) => {
    try {
        const mentor = await User.findById(req.userId)
            .select("username email phone role");

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: mentor
        });

    } catch (err) {
        console.error("GET CURRENT MENTOR ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const deleteMentor = async (req, res) => {
    const userId = req.userId;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mentor deleted successfully"
        });

    } catch (err) {
        console.error("Delete mentor error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const createMentorProfile = async (req, res) => {
    const userId = req.userId;

    try {
        const mentor = await User.findById(userId);

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        if (mentor.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Only mentors can create a mentor profile"
            });
        }

        const existingProfile = await MentorProfile.findOne({ userId });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Mentor profile already exists"
            });
        }

        const {
            name,
            education,
            workType,
            experience,
            expertIn,
            specialization,
            bio,
            languages,
            organization,
            designation,
            origin
        } = req.body;

        const mentorProfile = await MentorProfile.create({
            userId,
            name,
            education,
            workType,
            experience,
            expertIn,
            specialization,
            bio,
            languages,
            organization,
            designation,
            origin
        });

        return res.status(201).json({
            success: true,
            message: "Mentor profile created successfully",
            data: mentorProfile
        });

    } catch (err) {
        console.error("Create mentor profile error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const showMentors = async (req, res) => {
    try {
        const mentors = await MentorProfile.find({ isAvailable: { $ne: false } });

        if (mentors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No mentors found"
            });
        }

        return res.status(200).json({
            success: true,
             mentors
        });

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const showMentorProfile = async (req, res) => {

    const userId = req.userId;

    try {

        const mentorDetails = await User.findById(userId)
            .select("username email phone role");

        if (!mentorDetails) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        if (mentorDetails.role !== "mentor") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const profileDetails = await MentorProfile.findOne({
            userId: userId
        });

        return res.status(200).json({
            success: true,
            hasProfile: !!profileDetails,
            data: {
                mentor: mentorDetails,
                profile: profileDetails
            }
        });

    } catch (err) {

        console.error("SHOW MENTOR PROFILE ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


export const getMentees = async (req, res) => {
    try {
        const mentorId = req.userId;

        const conversations = await Conversation.find({ mentor: mentorId })
            .populate("student", "username email phone")
            .sort({ updatedAt: -1 });

        // Build mentees list — only include conversations with at least one message
        const menteesData = await Promise.all(
            conversations.map(async (conv) => {
                const lastMessage = await Message.findOne({ conversation: conv._id })
                    .sort({ createdAt: -1 })
                    .select("message createdAt");

                if (!lastMessage) return null; // skip empty conversations

                const profile = await UserProfile.findOne({ userId: conv.student._id });

                return {
                    conversationId: conv._id,
                    student: conv.student,
                    profile: profile || null,
                    lastMessage: {
                        message: lastMessage.message,
                        createdAt: lastMessage.createdAt
                    }
                };
            })
        );

        const filtered = menteesData.filter(Boolean);

        return res.status(200).json({
            success: true,
            data: filtered
        });

    } catch (err) {
        console.error("GET MENTEES ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getMentorDashboardData = async (req, res) => {
    try {
        const mentorId = req.userId;

        const conversations = await Conversation.find({ mentor: mentorId })
            .populate("student", "username email phone")
            .sort({ updatedAt: -1 });

        const mentorProfile = await MentorProfile.findOne({ userId: mentorId });

        const menteesData = await Promise.all(
            conversations.map(async (conv) => {
                if (!conv.student) return null;

                const lastMessage = await Message.findOne({ conversation: conv._id })
                    .sort({ createdAt: -1 })
                    .select("message createdAt");

                if (!lastMessage) return null;

                const profile = await UserProfile.findOne({ userId: conv.student._id });

                return {
                    conversationId: conv._id,
                    student: conv.student,
                    profile: profile || null,
                    lastMessage: {
                        message: lastMessage.message,
                        createdAt: lastMessage.createdAt
                    }
                };
            })
        );

        const filteredMentees = menteesData.filter(Boolean);

        // Sort by lastMessage.createdAt descending so latest message mentees are first
        filteredMentees.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
            const timeB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        return res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalConversations: conversations.length,
                    totalMentees: filteredMentees.length
                },
                availability: {
                    isAvailable: mentorProfile ? (mentorProfile.isAvailable !== false) : true
                },
                recentMentees: filteredMentees.slice(0, 4)
            }
        });
    } catch (err) {
        console.error("GET MENTOR DASHBOARD ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateMentorAvailability = async (req, res) => {
    try {
        const mentorId = req.userId;
        const { isAvailable } = req.body;

        const mentorProfile = await MentorProfile.findOneAndUpdate(
            { userId: mentorId },
            { isAvailable },
            { new: true }
        );

        if (!mentorProfile) {
            return res.status(404).json({
                success: false,
                message: "Mentor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Availability updated successfully",
            data: { isAvailable: mentorProfile.isAvailable }
        });
    } catch (err) {
        console.error("UPDATE AVAILABILITY ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};



export const createMentorReport = async (req, res) => {
    try {
        const mentorId = req.userId;
        const { studentId } = req.params;

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: "Student ID is required"
            });
        }

        const conversation = await Conversation.findOne({
            mentor: mentorId,
            student: studentId
        });

        if (!conversation) {
            return res.status(403).json({
                success: false,
                message: "This student is not your mentee"
            });
        }

        const existingReport = await MentorReport.findOne({
            mentorId: mentorId,
            studentId: studentId
        });

        if (existingReport) {
            return res.status(200).json({
                success: true,
                message: "Mentor report fetched successfully",
                report: existingReport
            });
        }

        const analysis = await ResumeAnalysis.findOne({
            userId: studentId
        }).sort({ createdAt: -1 });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Resume analysis not found for this student"
            });
        }

        const roleAnalysis = analysis.roleAnalysis;

        if (!roleAnalysis) {
            return res.status(404).json({
                success: false,
                message: "Role analysis not found for this student"
            });
        }

        const {
            role,
            strengths,
            weaknesses,
            missingSkills,
            valueAddingSkills
        } = roleAnalysis;

        const prompt = `
            You are an expert career mentor.

            Generate a professional career report for a mentor who is mentoring a student.

            The report must be based only on the student's resume analysis.

            TARGET ROLE:
            ${role}

            STRENGTHS:
            ${JSON.stringify(strengths)}

            WEAKNESSES:
            ${JSON.stringify(weaknesses)}

            MISSING SKILLS:
            ${JSON.stringify(missingSkills)}

            VALUE-ADDING SKILLS:
            ${JSON.stringify(valueAddingSkills)}

            Generate the report using exactly this JSON structure:

            {
                "careerSummary": "A detailed paragraph summarizing the student's current career profile, technical background and readiness for the target role.",
                "strengths": "A detailed paragraph explaining the student's strongest skills and how they are useful for the target role.",
                "weaknesses": "A detailed paragraph explaining the student's weaknesses and areas that need improvement.",
                "missingSkills": "A detailed paragraph explaining the important skills the student needs to develop for the target role.",
                "valueAddingSkills": "A detailed paragraph explaining additional skills that could make the student's profile stronger.",
                "careerGoals": "A detailed paragraph explaining what the student should focus on to become job-ready for the target role.",
                "mentorGuidance": "A detailed paragraph explaining how the mentor can practically guide this student."
            }

            RULES:

            1. Return ONLY valid JSON.
            2. Do not use markdown.
            3. Do not add any fields other than the specified fields.
            4. Every field must contain a meaningful paragraph.
            5. Every field must be a string.
            6. Do not use arrays.
            7. Do not use bullet points.
            8. Base the report only on the provided resume analysis.
            9. Do not invent skills, experience or qualifications.
            10. Keep the report professional and useful for a mentor.
            11. Do not mention that the report was generated by AI.
            `;

        console.log("GENERATING MENTOR REPORT...");

        const aiResponse = await aiService(prompt);

        if (!aiResponse) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate mentor report"
            });
        }

        const mentorReport = await MentorReport.create({
            studentId: studentId,
            mentorId: mentorId,
            analysisId: analysis._id,
            careerSummary: aiResponse.careerSummary,
            strengths: aiResponse.strengths,
            weaknesses: aiResponse.weaknesses,
            missingSkills: aiResponse.missingSkills,
            valueAddingSkills: aiResponse.valueAddingSkills,
            careerGoals: aiResponse.careerGoals,
            mentorGuidance: aiResponse.mentorGuidance
        });

        return res.status(201).json({
            success: true,
            message: "Mentor report generated successfully",
            report: mentorReport
        });

    } catch (err) {
        console.error("GET MENTOR REPORT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};