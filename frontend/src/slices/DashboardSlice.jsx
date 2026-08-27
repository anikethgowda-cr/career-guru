import axios from "../config/axios-config"
import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"

const initialState={
    data:null,
    loading:true,
    serverError:null
}

export const fetchResumeAnalysis=createAsyncThunk("dashboard/fetchResumeAnalysis",async(_,thunkAPI)=>{
    try{
        const response=await axios.get("/resume/analysis",{headers:{Authorization:`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTc2ZDQ5YzAzYjFjMjFkMzlmYzNmM2YiLCJyb2xlIjoidXNlciIsImlhdCI6MTc4Nzc2MjkxMSwiZXhwIjoxNzg4MzY3NzExfQ.d-QmTtCBQeT0ERPaOfG6fcNH8jnI2IpoCDwP7wG6Tmc`}})
       /*  console.log(response.data.data.roleAnalysis) */
        return response.data?.data
    }catch(err){
        
        const status =err.response.status
        const message = err.response.data.error
        console.log(err.response)
        return thunkAPI.rejectWithValue({status,message})
    }

})

export const dashboardSlice=createSlice({
    name:"dashboard",
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder.addCase(fetchResumeAnalysis.pending,(state,action)=>{
            state.loading=true
            state.serverError=null
        })
        .addCase(fetchResumeAnalysis.fulfilled, (state, action) => {
            state.loading = false
            state.data = action.payload
        })
        .addCase(fetchResumeAnalysis.rejected,(state,action)=>{
            state.loading = false
            state.serverError = action.payload
        })
    }
})

export default dashboardSlice.reducer;