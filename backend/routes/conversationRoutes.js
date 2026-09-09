import express from "express";
import { getOrCreateConversation, getUserConversations, getMessages } from "../controller/conversation-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import authenticateMentorAccess from "../middleware/authenticateMentorAccess.js";

const router = express.Router();

router.post("/conversations", authenticateUser,authenticateMentorAccess, getOrCreateConversation);
router.get("/conversations", authenticateUser, getUserConversations);
router.get("/conversations/:conversationId/messages", authenticateUser, getMessages);

export default router;