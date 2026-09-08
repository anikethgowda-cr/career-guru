import Conversation from "../models/conversationSchema.js";
import Message from "../models/messageSchema.js";
import User from "../models/userSchema.js";
import MentorProfile from "../models/mentorProfileSchema.js";




export const getOrCreateConversation = async (req, res) => {
    try {
        // Only students (role: "user") can initiate conversations
        if (req.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Only students can start a conversation with a mentor"
            });
        }

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

        // If conversation exists, return it (existing mentees always have access)
        if (conversation) {
            return res.status(200).json({
                success: true,
                data: conversation
            });
        }

        // New conversation — check if mentor has paused mentorship
        const mentorProfile = await MentorProfile.findOne({ userId: mentorId });
        if (mentorProfile && mentorProfile.isAvailable === false) {
            return res.status(403).json({
                success: false,
                message: "This mentor has temporarily paused mentorship and is not accepting new mentees"
            });
        }

        // Create new conversation
        conversation = await Conversation.create({
            student: studentId,
            mentor: mentorId
        });

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

export const getUserConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.role;

        // Role-aware filter
        const filter = role === "mentor"
            ? { mentor: userId }
            : { student: userId };

        const conversations = await Conversation.find(filter)
            .populate("student", "username email")
            .populate("mentor", "username email")
            .sort({ updatedAt: -1 });

        // For each conversation, get the last message.
        // Only include conversations that have at least one message.
        const conversationsWithLastMessage = await Promise.all(
            conversations.map(async (conv) => {
                const lastMessage = await Message.findOne({ conversation: conv._id })
                    .sort({ createdAt: -1 })
                    .select("message createdAt sender");

                if (!lastMessage) return null; // skip empty conversations

                return {
                    ...conv.toObject(),
                    lastMessage: {
                        message: lastMessage.message,
                        createdAt: lastMessage.createdAt
                    }
                };
            })
        );

        // Filter out null entries (empty conversations)
        const filtered = conversationsWithLastMessage.filter(Boolean);

        return res.status(200).json({
            success: true,
            data: filtered
        });

    } catch (error) {
        console.error("Get conversations error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch conversations",
            error: "Internal Server Error"
        });
    }
};


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