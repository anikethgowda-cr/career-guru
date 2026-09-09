import razorpay from "../config/razorpay.js";
import Payment from "../models/paymentSchema.js";
import crypto from "crypto";

export const createPaymentOrder = async (req, res) => {
    try {
        const userId = req.userId;

        const amount = 99;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `mentor_${userId}_${Date.now()}`
        });

        const payment = await Payment.create({
            userId: userId,
            razorpayOrderId: order.id,
            amount: amount,
            status: "created"
        });

        return res.status(201).json({
            success: true,
            message: "Payment order created successfully",
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            paymentId: payment._id
        });

    } catch (err) {
        console.error("CREATE PAYMENT ORDER ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to create payment order"
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const userId = req.userId;

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        const payment = await Payment.findOne({
            userId: userId,
            razorpayOrderId: razorpay_order_id
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment order not found"
            });
        }

        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "paid";

        await payment.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully"
        });

    } catch (err) {
        console.error("VERIFY PAYMENT ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to verify payment"
        });
    }
};

export const checkMentorAccess = async (req, res) => {
    try {
        const userId = req.userId;

        const payment = await Payment.findOne({
            userId: userId,
            status: "paid"
        });

        return res.status(200).json({
            success: true,
            hasAccess: !!payment
        });

    } catch (err) {
        console.error("CHECK MENTOR ACCESS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to check mentor access"
        });
    }
};