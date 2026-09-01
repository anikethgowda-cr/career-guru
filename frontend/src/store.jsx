import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from "./slices/DashboardSlice"
import LearningReducer from './slices/LearningPlanSlice'
import InterviewQuestionsReducer from "./slices/InterviewQuestionsSlice"
const store= configureStore({
    reducer:{
        dashboard:dashboardReducer,
        learningPlan:LearningReducer,
        interviewQuestions:InterviewQuestionsReducer,
    }
})

export default store