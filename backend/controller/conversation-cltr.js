import Conversation from "../models/conversationSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";


// =====================================================
// 1. CREATE OR GET CONVERSATION
// =====================================================

export const getOrCreateConversation = async (req, res) => {

    try {

        const { mentorId } = req.body;
        const studentId = req.userId;

        // Check mentorId
        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: "mentorId is required"
            });
        }

        // Student cannot chat with himself
        if (studentId === mentorId) {
            return res.status(400).json({
                success: false,
                message: "You cannot start a conversation with yourself"
            });
        }

        // Make sure mentor exists and actually has mentor role
        const mentor = await User.findOne({
            _id: mentorId,
            role: "mentor"
        });

        if (!mentor) {
            return res.status(404).json({
                success: false,
                message: "Mentor not found"
            });
        }

        // Check whether conversation already exists
        let conversation = await Conversation.findOne({
            student: studentId,
            mentor: mentorId
        });

        // If it doesn't exist, create it
        if (!conversation) {

            conversation = await Conversation.create({
                student: studentId,
                mentor: mentorId
            });

        }

        return res.status(200).json({
            success: true,
            data: conversation
        });

    } catch (error) {

        console.error("Get/Create conversation error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create conversation",
            error:"Internal Server Error"
        });

    }

};


// =====================================================
// 2. GET ALL CONVERSATIONS OF LOGGED-IN USER
// =====================================================

export const getUserConversations = async (req, res) => {

    try {

        const userId = req.userId;

        const conversations = await Conversation.find({

            $or: [
                { student: userId },
                { mentor: userId }
            ]

        })
        .populate("student", "username email")
        .populate("mentor", "username email")
        .sort({ updatedAt: -1 });

        return res.status(200).json({

            success: true,
            data: conversations

        });

    } catch (error) {

        console.error("Get conversations error:", error);

        return res.status(500).json({

            success: false,
            message: "Failed to fetch conversations",
            error:"Internal Server Error"

        });

    }

};


// =====================================================
// 3. GET MESSAGE HISTORY
// =====================================================

export const getMessages = async (req, res) => {

    try {

        const { conversationId } = req.params;

        const userId = req.userId;

        // First check whether the user belongs
        // to this conversation
        const conversation = await Conversation.findOne({

            _id: conversationId,

            $or: [
                { student: userId },
                { mentor: userId }
            ]

        });

        if (!conversation) {

            return res.status(403).json({

                success: false,
                message: "You are not allowed to access this conversation"

            });

        }

        // Get messages in chronological order
        const messages = await Message.find({

            conversation: conversationId

        })
        .populate("sender", "username")
        .sort({ createdAt: 1 });

        return res.status(200).json({

            success: true,
            data: messages

        });

    } catch (error) {

        console.error("Get messages error:", error);

        return res.status(500).json({

            success: false,
            message: "Failed to fetch messages",
            error:"Internal Server Error"

        });

    }

};