import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

const initialState = {
    data: null,
    // Information shown when plan doesn't exist
    targetRole: null,
    missingSkills: [],
    noAnalysis: false,
    loading: true,
    generating: false,
    serverError: null
};

export const fetchLearningPlan = createAsyncThunk("learningPlan/fetchLearningPlan", async (_, thunkAPI) => {
        try {
            const response = await axios.get("/course-plan");
            return response?.data;

        } catch (err) {
            if (err.response?.status === 404) {
                return {
                    noPlan: true,
                    noAnalysis: Boolean(err.response?.data?.noAnalysis),
                    message: err.response?.data?.message,
                    data: err.response?.data?.data || null
                };
            }
            
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                actionType: "fetch",
                message: err.response?.data?.message || "Failed to fetch learning plan"
            });
        }
    }
);

export const generateLearningPlan = createAsyncThunk("learningPlan/generateLearningPlan", async (_, thunkAPI) => {
        try {
            const response = await axios.post("/course-plan/generate");
            return response.data;

        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                actionType: "generate",
                message: err.response?.data?.message || "Failed to generate learning plan"
            });
        }
    }
);

const LearningPlanSlice = createSlice({
    name: "learningPlan",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchLearningPlan.pending, (state) => {
                    state.loading = true;
                    state.serverError = null;
                }
            )
            .addCase(fetchLearningPlan.fulfilled, (state, action) => {
                    state.loading = false;
                    state.serverError = null;

                    if (action.payload.noPlan) {
                        state.data = null;
                        state.noAnalysis = Boolean(action.payload.noAnalysis);
                        state.targetRole = action.payload.data?.targetRole || null;
                        state.missingSkills = action.payload.data?.missingSkills || [];
                        return;
                    }
                
                    state.noAnalysis = false;
                    state.data = action.payload.data;
                    state.loading = false;
                    state.serverError = null;
                }
            )
            .addCase(fetchLearningPlan.rejected, (state, action) => {
                    state.loading = false;
                    state.serverError = action.payload;
                }
            )
            .addCase(generateLearningPlan.pending, (state) => {
                    state.generating = true;
                    state.serverError = null;
                }
            )
            .addCase(generateLearningPlan.fulfilled, (state, action) => {
                    state.generating = false;
                    state.serverError = null;
                    state.noAnalysis = false;

                    state.data = action.payload.data;

                    state.targetRole = null;
                    state.missingSkills = [];
                }
            )
            .addCase(generateLearningPlan.rejected, (state, action) => {
                    state.generating = false;
                    state.serverError = action.payload;
                }
            );
    }
});

export default LearningPlanSlice.reducer;
