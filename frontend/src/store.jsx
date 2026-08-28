import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from "./slices/DashboardSlice"
import LearningReducer from './slices/LearningPlanSlice'

const store= configureStore({
    reducer:{
        dashboard:dashboardReducer,
        learningPlan:LearningReducer
    }
})

export default store