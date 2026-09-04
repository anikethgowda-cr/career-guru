import User from "../models/userSchema.js";
import UserProfile from "../models/userProfileSchema.js";
import ResumeAnalysis from "../models/resumeAnalysisSchema.js";
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