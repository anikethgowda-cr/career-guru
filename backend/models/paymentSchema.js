import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created"
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;