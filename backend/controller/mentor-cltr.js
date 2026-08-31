import User from "../models/userSchema.js";
import MentorProfile from "../models/mentorProfileSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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

        const existingProfile = await MentorProfile.findOne({
            userId
        });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Mentor profile already exists"
            });
        }

        const {
            designation,
            company,
            yearsOfExperience,
            specialization,
            bio,
            hourlyRate,
            availableSlots,
            languages
        } = req.body;

        const mentorProfile = await MentorProfile.create({
            userId,
            designation,
            company,
            yearsOfExperience,
            specialization,
            bio,
            hourlyRate,
            availableSlots,
            languages
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

export const showMentorProfile = async (req, res) => {
    const userId = req.userId;

    try {
        const mentorDetails = await User.findById(userId)
            .select("-password");

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
            userId
        });

        if (!profileDetails) {
            return res.status(404).json({
                success: false,
                message: "Mentor profile not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Mentor profile retrieved successfully",
            mentor: mentorDetails,
            profile: profileDetails
        });

    } catch (err) {
        console.error("Show mentor profile error:", err);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};