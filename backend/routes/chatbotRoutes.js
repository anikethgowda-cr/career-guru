import express from "express";
import { chatWithAI } from "../controller/chatbot-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import aiRateLimiter from "../middleware/aiRateLimiter.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/message", authenticateUser, authorizeRoles("user", "mentor"), aiRateLimiter, chatWithAI);

export default chatbotRouter;