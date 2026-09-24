import MentorPlan from "../models/mentorPlanSchema.js"

export const createMentorPlan = async (req, res) => {
    try {
        const mentorId = req.userId;
        const { price } = req.body;

        if (price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Price is required"
            });
        }

        const existingPlan = await MentorPlan.findOne({ mentorId });

        if (existingPlan) {
            return res.status(400).json({
                success: false,
                message: "Mentor plan already exists"
            });
        }

        const mentorPlan = await MentorPlan.create({
            mentorId,
            price
        });

        return res.status(201).json({
            success: true,
            message: "Mentor plan created successfully",
            plan: mentorPlan
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create mentor plan",
            error: error.message
        });
    }
};


export const getMentorPlan = async (req, res) => {
    try {
        const mentorId = req.userId;

        const mentorPlan = await MentorPlan.findOne({ mentorId });

        if (!mentorPlan) {
            return res.status(404).json({
                success: false,
                message: "Mentor plan not found"
            });
        }

        return res.status(200).json({
            success: true,
            plan: mentorPlan
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get mentor plan",
            error: error.message
        });
    }
};


export const updateMentorPlan = async (req, res) => {
    try {
        const mentorId = req.userId;
        const { price } = req.body;

        if (price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Price is required"
            });
        }

        const mentorPlan = await MentorPlan.findOne({ mentorId });

        if (!mentorPlan) {
            return res.status(404).json({
                success: false,
                message: "Mentor plan not found"
            });
        }

        mentorPlan.price = price;

        await mentorPlan.save();

        return res.status(200).json({
            success: true,
            message: "Mentor plan updated successfully",
            plan: mentorPlan
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update mentor plan",
            error: error.message
        });
    }
};

export const getMentorPlanByMentorId = async (req, res) => {
    try {
        const { mentorId } = req.params;

        const mentorPlan = await MentorPlan.findOne({ mentorId });

        if (!mentorPlan) {
            return res.status(404).json({
                success: false,
                message: "Mentor plan not found"
            });
        }

        return res.status(200).json({
            success: true,
            plan: {
                price: mentorPlan.price,
                _id: mentorPlan._id
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to get mentor plan",
            error: error.message
        });
    }
};