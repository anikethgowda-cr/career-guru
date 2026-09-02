import { configureStore } from '@reduxjs/toolkit'

import dashboardReducer from "./slices/DashboardSlice"
import LearningReducer from './slices/LearningPlanSlice'
import InterviewQuestionsReducer from "./slices/InterviewQuestionsSlice"
import JobsReducer from "./slices/JobsSlice"
import authReducer from "./slices/AuthSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        learningPlan: LearningReducer,
        interviewQuestions: InterviewQuestionsReducer,
        jobs: JobsReducer,
    }
})

export default store

