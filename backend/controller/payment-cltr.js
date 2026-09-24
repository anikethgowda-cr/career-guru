import razorpay from "../config/razorpay.js";
import Payment from "../models/paymentSchema.js";
import MentorPlan from "../models/mentorPlanSchema.js";
import Subscription from "../models/subscriptionSchema.js";
import Conversation from "../models/conversationSchema.js";
import crypto from "crypto";

export const createPaymentOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { mentorId } = req.body;

        if (!mentorId) {
            return res.status(400).json({
                success: false,
                message: "Mentor ID is required"
            });
        }

        // Prevent duplicate active subscriptions
        const existingSubscription = await Subscription.findOne({
            studentId: userId,
            mentorId: mentorId,
            status: "active",
            endDate: { $gt: new Date() }
        });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "You already have an active subscription with this mentor",
                endDate: existingSubscription.endDate
            });
        }

        const mentorPlan = await MentorPlan.findOne({
            mentorId: mentorId
        });

        if (!mentorPlan) {
            return res.status(404).json({
                success: false,
                message: "Mentor plan not found"
            });
        }

        const amount = mentorPlan.price;

        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency: "INR",
            receipt: `mentor_${mentorId}_${Date.now()}`
        });

        const payment = await Payment.create({
            userId: userId,
            mentorId: mentorId,
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

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        const signatureValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, "hex"),
            Buffer.from(razorpay_signature, "hex")
        );

        if (!signatureValid) {
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

        // Prevent duplicate subscription
        if (payment.status === "paid") {
            return res.status(400).json({
                success: false,
                message: "Payment already verified"
            });
        }

        // Mark payment as paid
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.status = "paid";

        await payment.save();

        // Get mentor's plan
        const mentorPlan = await MentorPlan.findOne({
            mentorId: payment.mentorId
        });

        if (!mentorPlan) {
            return res.status(404).json({
                success: false,
                message: "Mentor plan not found"
            });
        }

        // Subscription starts now
        const startDate = new Date();

        // Subscription duration is fixed at 30 days
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);

        // Create subscription
        const subscription = await Subscription.create({
            studentId: payment.userId,
            mentorId: payment.mentorId,
            planId: mentorPlan._id,
            startDate: startDate,
            endDate: endDate,
            status: "active"
        });

        // Auto-provision a conversation so both sides can chat immediately
        await Conversation.findOneAndUpdate(
            { student: payment.userId, mentor: payment.mentorId },
            { $setOnInsert: { student: payment.userId, mentor: payment.mentorId } },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Payment verified and subscription activated",
            subscriptionId: subscription._id
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
        const mentorId = req.params?.mentorId || req.query?.mentorId;

        const query = {
            studentId: userId,
            status: "active",
            endDate: { $gt: new Date() }
        };

        if (mentorId) {
            query.mentorId = mentorId;
        }

        const subscription = await Subscription.findOne(query);

        if (!subscription) {
            return res.status(200).json({
                success: true,
                hasAccess: false,
                message: mentorId
                    ? "Active subscription with this mentor not found"
                    : "No active mentor subscriptions found"
            });
        }

        return res.status(200).json({
            success: true,
            hasAccess: true,
            subscriptionId: subscription._id,
            endDate: subscription.endDate
        });

    } catch (err) {
        console.error("CHECK MENTOR ACCESS ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to check mentor access"
        });
    }
};