import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from "./slices/DashboardSlice"

const store= configureStore({
    reducer:{
        dashboard:dashboardReducer
    }
})

export default store