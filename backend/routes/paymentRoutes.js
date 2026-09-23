import express from "express";
import { createPaymentOrder, verifyPayment, checkMentorAccess } from "../controller/payment-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const paymentRouter = express.Router();

paymentRouter.post("/payment/create-order", authenticateUser, authorizeRoles("user"), createPaymentOrder);
paymentRouter.post("/payment/verify", authenticateUser, authorizeRoles("user"), verifyPayment);
paymentRouter.get("/payment/access", authenticateUser, authorizeRoles("user"), checkMentorAccess);

export default paymentRouter;