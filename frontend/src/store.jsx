import { configureStore } from '@reduxjs/toolkit'

import authReducer from "./slices/AuthSlice"
import resumeReducer from "./slices/ResumeSlice"
import dashboardReducer from "./slices/DashboardSlice"
import LearningReducer from './slices/LearningPlanSlice'
import InterviewQuestionsReducer from "./slices/InterviewQuestionsSlice"
import JobsReducer from "./slices/JobsSlice"
import MentorsReducer from "./slices/MentorSlice"
import mentorChatReducer from "./slices/MentorChatSlice";

import ProfileReducer from "./slices/ProfileSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        resume:resumeReducer,
        dashboard: dashboardReducer,
        learningPlan: LearningReducer,
        interviewQuestions: InterviewQuestionsReducer,
        jobs: JobsReducer,
        profile:ProfileReducer,
        mentor:MentorsReducer,
        mentorChat: mentorChatReducer,
        
    }
})

export default store

