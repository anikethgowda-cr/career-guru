import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from "./slices/DashboardSlice"
import LearningReducer from './slices/LearningPlanSlice'
import InterviewQuestionsReducer from "./slices/InterviewQuestionsSlice"
import JobsReducer from "./slices/JobsSlice"

const store= configureStore({
    reducer:{
        dashboard:dashboardReducer,
        learningPlan:LearningReducer,
        interviewQuestions:InterviewQuestionsReducer,
        jobs:JobsReducer,
    }
})

export default store