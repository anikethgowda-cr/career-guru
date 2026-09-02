import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import axios from "../config/axios-config"

const initialState={
    data:null,
    loading:true,
    serverError:null
}

export const fetchJobs = createAsyncThunk("jobs/fetchJobs",async(_ ,thunkAPI)=>{
    try{
        const response= await axios.get("/jobs")
        return response.data

    }catch(err){
        console.log(err.response?.data)
        return thunkAPI.rejectWithValue({
            status:err.response?.status || 500, 
            message:err.response?.data?.message || "something went wrong"
        })
    }
})



const jobsSlice =createSlice({
    name:"jobs",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder
            .addCase(fetchJobs.pending,(state)=>{
                state.loading=true
                state.serverError=null
            })
            .addCase(fetchJobs.fulfilled,(state,action)=>{
                state.loading=false
                state.serverError=null
                state.data=action.payload.jobs
            })
            .addCase(fetchJobs.rejected,(state,action)=>{
                state.loading=false
                state.serverError=action.payload
            })

    }
})

export default jobsSlice.reducer