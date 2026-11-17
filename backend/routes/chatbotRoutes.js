import express from "express";
import { chatWithAI } from "../controller/chatbot-cltr.js";
import authenticateUser from "../middleware/authentication.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/message", authenticateUser, authorizeRoles("user", "mentor"), chatWithAI);

export default chatbotRouter;