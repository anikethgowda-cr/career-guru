import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

export const createMentorPlan = createAsyncThunk(
    "mentorPlan/createMentorPlan",
    async ({ price }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/mentor-plan", { price });
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Failed to create mentor plan"
            });
        }
    }
);

export const getMentorPlan = createAsyncThunk(
    "mentorPlan/getMentorPlan",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/mentor-plan");
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Failed to fetch mentor plan"
            });
        }
    }
);

export const updateMentorPlan = createAsyncThunk(
    "mentorPlan/updateMentorPlan",
    async ({ price }, { rejectWithValue }) => {
        try {
            const response = await axios.put("/mentor-plan", { price });
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Failed to update mentor plan"
            });
        }
    }
);

const initialState = {
    plan: null,
    loading: false,
    error: null
};

const mentorPlanSlice = createSlice({
    name: "mentorPlan",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createMentorPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMentorPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.plan = action.payload.plan;
            })
            .addCase(createMentorPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMentorPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMentorPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.plan = action.payload.plan;
            })
            .addCase(getMentorPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateMentorPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMentorPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.plan = action.payload.plan;
            })
            .addCase(updateMentorPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default mentorPlanSlice.reducer;
