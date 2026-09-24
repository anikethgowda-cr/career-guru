import express from "express";
import { getPendingPayouts, processPayout, completePayout } from "../controller/payout-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const payoutRouter = express.Router();

// Get pending payouts
payoutRouter.get("/payouts/pending", authenticateUser, authorizeRoles("admin"), getPendingPayouts);
// Start payout
payoutRouter.patch("/payouts/:subscriptionId/process", authenticateUser, authorizeRoles("admin"), processPayout);
// Complete payout
payoutRouter.patch("/payouts/:subscriptionId/complete", authenticateUser, authorizeRoles("admin"), completePayout);

export default payoutRouter;