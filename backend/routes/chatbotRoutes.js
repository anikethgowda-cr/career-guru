import express from "express";
import { chatWithAI } from "../controller/chatbot-cltr.js";
import authenticateUser from "../middleware/authentication.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/message", authenticateUser, chatWithAI);

export default chatbotRouter;