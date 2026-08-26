import express from "express";
import { getOrCreateConversation, getUserConversations, getMessages } from "../controller/conversation-cltr.js";
import authenticateUser from "../middleware/authentication.js";

const router = express.Router();

router.post("/conversations", authenticateUser, getOrCreateConversation);
router.get("/conversations", authenticateUser, getUserConversations);

router.get("/:conversationId/messages", authenticateUser, getMessages);

export default router;