import express from "express";
import { createPaymentOrder, verifyPayment, checkMentorAccess } from "../controller/payment-cltr.js";
import authenticateUser from "../middleware/authentication.js";

const paymentRouter = express.Router();

paymentRouter.post( "/payment/create-order", authenticateUser, createPaymentOrder);
paymentRouter.post( "/payment/verify",authenticateUser, verifyPayment);
paymentRouter.get( "/payment/access", authenticateUser, checkMentorAccess);

export default paymentRouter;