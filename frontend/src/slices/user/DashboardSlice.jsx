import axios from "../../config/axios-config"
import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"

const initialState={
    data:null,
    loading:true,
    serverError:null
}

export const fetchResumeAnalysis=createAsyncThunk("dashboard/fetchResumeAnalysis",async(_,thunkAPI)=>{
    try{
        const response=await axios.get("/resume/analysis")
        return response.data?.data
    }catch(err){
        const status =err.response?.status
        const message = err.response?.data?.message
        return thunkAPI.rejectWithValue({status,message})
    }
})

export const dashboardSlice=createSlice({
    name:"dashboard",
    initialState,
    reducers:{
        clearDashboardAnalysis: (state) => {
            state.data = null;
            state.loading = false;
            state.serverError = null;
        }
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

export const { clearDashboardAnalysis } = dashboardSlice.actions;

export default dashboardSlice.reducer;
