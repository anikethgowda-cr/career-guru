import Payment from "../models/paymentSchema.js";

const authenticateMentorAccess = async (req, res, next) => {
    try {
        const userId = req.userId;

        const payment = await Payment.findOne({
            userId: userId,
            status: "paid"
        });

        if (!payment) {
            return res.status(403).json({
                success: false,
                message: "Mentor access requires a successful payment"
            });
        }

        next();

    } catch (err) {
        console.error("MENTOR ACCESS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to verify mentor access"
        });
    }
};

export default authenticateMentorAccess;