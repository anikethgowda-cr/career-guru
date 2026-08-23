import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import configureDb from "./config/db.js"
configureDb()
import userRouter from "./routes/userRoutes.js"
import mentorRouter from "./routes/mentorRoutes.js"
import resumeRouter from "./routes/usersResume.js"
import coursePlanRouter from "./routes/coursePlanRoutes.js";
import interviewQuestionsRoutes from "./routes/interviewQuestionsRoutes.js"
import jobsRoutes from "./routes/jobsRoutes.js"


const app=express()
app.use(cors())
app.use(express.json())

app.use("/api",userRouter)
app.use("/api",mentorRouter)
app.use("/api",resumeRouter)
app.use("/api", coursePlanRouter);
app.use("/api",interviewQuestionsRoutes)
app.use("/api",jobsRoutes)

app.listen(process.env.PORT,()=>{
    console.log("Server Is Running On Port "+ process.env.PORT);
})