import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    data: null,
    // Information shown when plan doesn't exist
    targetRole: null,
    missingSkills: [],
    loading: true,
    generating: false,
    serverError: null
};

export const fetchLearningPlan = createAsyncThunk("learningPlan/fetchLearningPlan",async (_, thunkAPI) => {
        try {
            const response = await axios.get("/course-plan",{headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}})
            return response?.data;

        } catch (err) {
            // 404 means:
            // User doesn't have a learning plan yet.
            // This is NOT an actual application error.
            if (err.response?.status === 404) {
                return {
                    noPlan: true,
                    data: err.response?.data?.data || null
                };
            }
            
            // Actual error
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:err.response?.data?.error ||"Failed to fetch learning plan"
            });
        }
    }
);

export const generateLearningPlan = createAsyncThunk("learningPlan/generateLearningPlan",async (_, thunkAPI) => {
        try {
            const response = await axios.post("/course-plan/generate",{},{headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}});
            return response.data;

        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:err.response?.data?.error || "Failed to generate learning plan"
            });
        }
    }
);

const LearningPlanSlice = createSlice({
    name: "learningPlan",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchLearningPlan.pending,(state) => {
                    state.loading = true;
                    state.serverError = null;
                }
            )
            .addCase(fetchLearningPlan.fulfilled,(state, action) => {
                    state.loading = false;
                    state.serverError = null;

                    // No learning plan
                    if (action.payload.noPlan) {
                        state.data = null;
                        state.targetRole =action.payload.data?.targetRole || null;
                        state.missingSkills =action.payload.data?.missingSkills || [];
                        return
                    }
                
                    // Learning plan exists
                    state.data = action.payload.data;
                    state.loading=false
                    state.serverError=null
                }
            )
            .addCase(fetchLearningPlan.rejected,(state, action) => {
                    state.loading = false;
                    state.serverError = action.payload;
                }
            )
            .addCase(generateLearningPlan.pending,(state) => {
                    state.generating = true;
                    state.serverError = null;
                }
            )
            .addCase(generateLearningPlan.fulfilled,(state, action) => {
                    state.generating = false;
                    state.serverError = null;

                    // Store generated plan
                    state.data = action.payload.data;

                    // These are no longer needed
                    state.targetRole = null;
                    state.missingSkills = [];
                }
            )
            .addCase(generateLearningPlan.rejected,(state, action) => {
                    state.generating = false;
                    state.serverError = action.payload;
                }
            );
    }
});


export default LearningPlanSlice.reducer;