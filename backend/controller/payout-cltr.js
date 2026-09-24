import Subscription from "../models/subscriptionSchema.js";


// Get all pending payouts
export const getPendingPayouts = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            status: "expired",
            payoutStatus: "pending"
        })
            .populate("studentId", "username email")
            .populate("mentorId", "username email")
            .populate("planId", "price");

        return res.status(200).json({
            success: true,
            data: subscriptions
        });

    } catch (error) {
        console.error("GET PENDING PAYOUTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending payouts"
        });
    }
};


// Start processing a payout
export const processPayout = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        if (subscription.status !== "expired") {
            return res.status(400).json({
                success: false,
                message: "Subscription has not expired yet"
            });
        }

        if (subscription.payoutStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Payout is not pending"
            });
        }

        subscription.payoutStatus = "processing";

        await subscription.save();

        return res.status(200).json({
            success: true,
            message: "Payout processing started"
        });

    } catch (error) {
        console.error("PROCESS PAYOUT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to process payout"
        });
    }
};


// Complete a payout
export const completePayout = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await Subscription.findById(subscriptionId);

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription not found"
            });
        }

        if (subscription.payoutStatus !== "processing") {
            return res.status(400).json({
                success: false,
                message: "Payout is not being processed"
            });
        }

        subscription.payoutStatus = "paid";
        subscription.payoutAt = new Date();

        await subscription.save();

        return res.status(200).json({
            success: true,
            message: "Payout completed successfully"
        });

    } catch (error) {
        console.error("COMPLETE PAYOUT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to complete payout"
        });
    }
};