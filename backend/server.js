import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import configureDb from "./config/db.js";
configureDb();

import chatSocket from "./services/chatSocket.js";
import socketAuth from "./middleware/socketAuth.js";

import userRouter from "./routes/userRoutes.js";
import mentorRouter from "./routes/mentorRoutes.js";
import resumeRouter from "./routes/usersResume.js";
import coursePlanRouter from "./routes/coursePlanRoutes.js";
import interviewQuestionsRoutes from "./routes/interviewQuestionsRoutes.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import cloudinary from "./config/cloudinary.js";
import chatbotRouter from "./routes/chatbotRoutes.js";
import assessmentRouter from "./routes/assessmentRoutes.js";
import mentorPlanRouter from "./routes/mentorPlanRoutes.js";
import payoutRouter from "./routes/payoutRoutes.js";

// Subscription background jobs
import "./config/subscriptionExpiry.js";
import "./config/subscriptionReminder.js";


const app = express();
const server = http.createServer(app);

const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

// CORS configuration (supports Localhost, Vercel apps, and custom FRONTEND_URL)
const corsOptions = {
    origin: (origin, callback) => {
        if (
            !origin ||
            origin.includes("localhost") ||
            origin.endsWith(".vercel.app") ||
            (frontendUrl && origin === frontendUrl)
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true
};

const io = new Server(server, { cors: corsOptions });

// Socket.io authentication
io.use(socketAuth);

// ChatSocket
chatSocket(io);

// Express middleware
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/api", userRouter);
app.use("/api", mentorRouter);
app.use("/api", resumeRouter);
app.use("/api", coursePlanRouter);
app.use("/api", interviewQuestionsRoutes);
app.use("/api", jobsRoutes);
app.use("/api", conversationRouter);
app.use("/api", paymentRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api", assessmentRouter);
app.use("/api", mentorPlanRouter);
app.use("/api", payoutRouter);


cloudinary.api.ping()
    .then(async (result) => {
        try {
            await cloudinary.api.upload_preset("careerguru_interviews");
        } catch {
            await cloudinary.api.create_upload_preset({
                name: "careerguru_interviews",
                unsigned: true,
                folder: "careerguru/interviews"
            }).catch((err) => console.log("Cloudinary preset auto-init:", err.message));
        }
    })
    .catch((error) => console.error("Cloudinary connection failed:", error));


// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log("Server Is Running On Port " + PORT);
});