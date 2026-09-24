import Subscription from "../models/subscriptionSchema.js";
import Conversation from "../models/conversationSchema.js";

const authenticateMentorAccess = async (req, res, next) => {
    try {
        const userId = req.userId;

        // Mentors do not need a student subscription
        if (req.role === "mentor") {
            return next();
        }

        const mentorId =
            req.params?.mentorId ||
            req.body?.mentorId ||
            req.query?.mentorId;

        let actualMentorId = mentorId;

        // For message routes, get mentorId from conversation
        if (!actualMentorId && req.params.conversationId) {

            const conversation = await Conversation.findOne({
                _id: req.params.conversationId,
                student: userId
            });

            if (!conversation) {
                return res.status(403).json({
                    success: false,
                    message: "Conversation not found or access denied"
                });
            }

            actualMentorId = conversation.mentor;
        }

        if (!actualMentorId) {
            return res.status(400).json({
                success: false,
                message: "Mentor ID is required"
            });
        }

        const subscription = await Subscription.findOne({
            studentId: userId,
            mentorId: actualMentorId,
            status: "active",
            endDate: { $gt: new Date() }
        });

        if (!subscription) {
            return res.status(403).json({
                success: false,
                message: "Active mentor subscription required"
            });
        }

        req.subscription = subscription;

        next();

    } catch (err) {
        console.error("MENTOR ACCESS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to verify mentor access",
            error: err.message,
            stack: err.stack
        });
    }
};

export default authenticateMentorAccess;