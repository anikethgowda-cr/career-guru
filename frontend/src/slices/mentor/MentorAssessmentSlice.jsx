import {createSlice,createAsyncThunk} from "@reduxjs/toolkit"
import axios from "../../config/axios-config"


const initialState={
    assessment:null,
    mentees: [],
    message:null,
    loading:false,
    serverError:null
}

export const createAssessmentManually= createAsyncThunk("mentorAssessment/createAssessmentManually",async(formData ,thunkAPI)=>{
    try{
        const response = await axios.post("/assessment/manual",formData)
        return response.data

    }catch(err){
        console.log(err.response?.data?.message)
        return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed with assessment creation"
            })
    }
})

export const fetchMentees = createAsyncThunk( "mentees/fetchMentees", async (_, thunkAPI) => {
        try {
            const response = await axios.get("/mentor/mentees")
            return response.data
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch mentees"
            })
        }
    }
)

export const generateAiQuestions = createAsyncThunk("mentorAssessment/generateAiQuestions",async(questionsData ,thunkAPI)=>{
    try{
        const response = await axios.post("/assessment/aiQuestions",questionsData)
        return response.data

    }catch(err){
        console.log(err.response.data.message)
        return thunkAPI.rejectWithValue({
            status: err.response?.status,
            message:
                err.response?.data?.message ||
                "Failed to fetch mentees"
        })
    }
})

export const createAiAssessment = createAsyncThunk("mentorAssessment/createAiAssessment",async(assessmentData,thunkAPI)=>{
    try{
        const response = await axios.post("/assessment/ai",assessmentData)
        console.log(response)
        return response.data

    }catch(err){
        console.log(err.response.data.message)
        return thunkAPI.rejectWithValue({
            status:err.response?.status,
            message:
                err.response?.data?.message||
                "Failed To Create Assessment"
        })
    }
})





const mentorAssessmentSlice = createSlice({
    name:"mentorAssessment",
    initialState,
    reducers:{

    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchMentees.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchMentees.fulfilled, (state, action) => {
                state.loading = false;
                state.mentees = action.payload.data;

                state.serverError = null;
            })
            .addCase(fetchMentees.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            })
            .addCase(createAssessmentManually.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(createAssessmentManually.fulfilled, (state, action) => {
                state.loading = false;
                state.assessment = action.payload.data;
                state.message= action.payload.message
                state.serverError = null;
            })
            .addCase(createAssessmentManually.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            })
            .addCase(createAiAssessment.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(createAiAssessment.fulfilled, (state, action) => {
                state.loading = false;
                state.assessment = action.payload.data;
                state.message= action.payload.message
                state.serverError = null;
            })
            .addCase(createAiAssessment.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            })
    }

})


export default mentorAssessmentSlice.reducer