import express from "express";
import { getOrCreateConversation, getUserConversations, getMessages } from "../controller/conversation-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import authenticateMentorAccess from "../middleware/authenticateMentorAccess.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.post("/conversations", authenticateUser, authorizeRoles("user"), authenticateMentorAccess, getOrCreateConversation);
router.get("/conversations", authenticateUser, authorizeRoles("user", "mentor"), getUserConversations);
router.get("/conversations/:conversationId/messages", authenticateUser, authorizeRoles("user", "mentor"), getMessages);

export default router;