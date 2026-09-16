import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios-config"

const initialState = {
    assessments: [],
    selectedAssessment: null,
    attempt: null,
    loading: false,
    serverError: null
};

export const fetchAssessments=createAsyncThunk("userAssessment/fetchAssessments",async(_ ,thunkAPI)=>{
    try{
        const response = await axios.get("/assessments")
        return response.data

    } catch(err){
        console.log(err.response?.data?.message || err.message)
        return thunkAPI.rejectWithValue({
            status:err.response?.status,
            message:err.response?.data?.message||
            "Something went wrong"
        })
    }
})

export const createAssessmentAttempt = createAsyncThunk( "userAssessment/createAssessmentAttempt",async (assessmentId, thunkAPI) => {
        try {
            const response = await axios.post("/assessment/attempt", {
                assessmentId
            });

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to create assessment attempt"
            });
        }
    }
);

export const fetchAssessmentById = createAsyncThunk("userAssessment/fetchAssessmentById",async (assessmentId, thunkAPI) => {
        try {
            const response = await axios.get(`/assessment/${assessmentId}`);

            return response.data;
        } catch (err) {
            console.log("Assessment Attempt Error:", err.response?.data);
            console.log("Status:", err.response?.status);
            console.log("Error:", err.message);

            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to create assessment attempt"
            });
        }
    }
);


export const submitAssessment = createAsyncThunk(
    "userAssessment/submitAssessment",
    async (formData, thunkAPI) => {
        try {
            const response = await axios.post("/assessment/submit", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                timeout: 5 * 60 * 1000 // 5 minutes timeout for video upload
            });
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to submit assessment"
            });
        }
    }
);

const UserAssessmentSlice = createSlice({
    name:"userAssessment",
    initialState,
    reducers:{

    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAssessments.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchAssessments.fulfilled, (state, action) => {
                state.loading = false;
                state.assessments = action.payload.data;
                state.serverError = null;
            })
            .addCase(fetchAssessments.rejected, (state, action) => {
                if (action.payload?.status === 404) {
                    state.assessments = [];
                    state.serverError = null;
                } else {
                    state.serverError =
                        typeof action.payload === "string"
                            ? action.payload
                            : action.payload?.message || "Failed to fetch assessments";
                }
                state.loading = false;
            })
            .addCase(createAssessmentAttempt.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(createAssessmentAttempt.fulfilled, (state, action) => {
                state.loading = false;
                state.attempt = action.payload.data;
                state.serverError = null;
            })
            .addCase(createAssessmentAttempt.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload?.message || "Failed to create assessment attempt";
            })
            .addCase(fetchAssessmentById.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchAssessmentById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedAssessment = action.payload.data;
            })
            .addCase(fetchAssessmentById.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload?.message || "Failed to fetch assessment";
            })
            .addCase(submitAssessment.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(submitAssessment.fulfilled, (state, action) => {
                state.loading = false;
                state.attempt = action.payload.data;
                state.serverError = null;
            })
            .addCase(submitAssessment.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload?.message || "Failed to submit assessment";
            });
    }
})


export default UserAssessmentSlice.reducer