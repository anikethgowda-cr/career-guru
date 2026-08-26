import express from "express"
import cors from "cors"
import http from "http";
import { Server } from "socket.io";

import dotenv from "dotenv"
dotenv.config()

import configureDb from "./config/db.js"
configureDb()

import chatSocket from "./services/chatSocket.js";
import socketAuth from "./middleware/socketAuth.js";

import userRouter from "./routes/userRoutes.js"
import mentorRouter from "./routes/mentorRoutes.js"
import resumeRouter from "./routes/usersResume.js"
import coursePlanRouter from "./routes/coursePlanRoutes.js";
import interviewQuestionsRoutes from "./routes/interviewQuestionsRoutes.js"
import jobsRoutes from "./routes/jobsRoutes.js"
import conversationRouter from "./routes/conversationRoutes.js";

const app=express()
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});
//Socket.io authentication
io.use(socketAuth)

//ChatSocket
chatSocket(io)

//express middleware
app.use(cors())
app.use(express.json())

//Routes
app.use("/api",userRouter)
app.use("/api",mentorRouter)
app.use("/api",resumeRouter)
app.use("/api", coursePlanRouter);
app.use("/api",interviewQuestionsRoutes)
app.use("/api",jobsRoutes)
app.use("/api", conversationRouter)

//Start Server
server.listen(process.env.PORT,()=>{
    console.log("Server Is Running On Port "+ process.env.PORT);
})