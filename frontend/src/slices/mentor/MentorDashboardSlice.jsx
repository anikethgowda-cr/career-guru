import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

const initialState = {
    stats: {
        totalConversations: 0,
        totalMentees: 0
    },
    availability: {
        isAvailable: true
    },
    recentMentees: [],
    loading: true,
    updatingAvailability: false,
    serverError: null
};

export const fetchMentorDashboardData = createAsyncThunk(
    "mentorDashboard/fetchMentorDashboardData",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/mentor/dashboard");
            return response.data?.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to load mentor dashboard data"
            });
        }
    }
);

export const updateAvailability = createAsyncThunk(
    "mentorDashboard/updateAvailability",
    async (isAvailable, thunkAPI) => {
        try {
            const response = await axios.patch("/mentor/availability", { isAvailable });
            return response.data?.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to update availability"
            });
        }
    }
);

const mentorDashboardSlice = createSlice({
    name: "mentorDashboard",
    initialState,
    reducers: {
        clearMentorDashboardState: (state) => {
            state.stats = {
                totalConversations: 0,
                totalMentees: 0
            };
            state.availability = { isAvailable: true };
            state.recentMentees = [];
            state.loading = false;
            state.serverError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Dashboard Data
            .addCase(fetchMentorDashboardData.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchMentorDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.serverError = null;
                state.stats = action.payload?.stats || { totalConversations: 0, totalMentees: 0 };
                state.availability = action.payload?.availability || { isAvailable: true };
                state.recentMentees = action.payload?.recentMentees || [];
            })
            .addCase(fetchMentorDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            })

            // Update Availability
            .addCase(updateAvailability.pending, (state) => {
                state.updatingAvailability = true;
            })
            .addCase(updateAvailability.fulfilled, (state, action) => {
                state.updatingAvailability = false;
                if (action.payload?.isAvailable !== undefined) {
                    state.availability.isAvailable = action.payload.isAvailable;
                }
            })
            .addCase(updateAvailability.rejected, (state) => {
                state.updatingAvailability = false;
            });
    }
});

export const { clearMentorDashboardState } = mentorDashboardSlice.actions;

export default mentorDashboardSlice.reducer;
