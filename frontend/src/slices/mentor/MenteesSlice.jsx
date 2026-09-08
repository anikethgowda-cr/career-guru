import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

const initialState = {
    mentees: [],
    loading: false,
    serverError: null
};

export const fetchMentees = createAsyncThunk( "mentees/fetchMentees", async (_, thunkAPI) => {
        try {
            const response = await axios.get("/mentor/mentees");
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch mentees"
            });
        }
    }
);

const menteesSlice = createSlice({
    name: "mentees",
    initialState,
    reducers: {
        clearMentees: (state) => {
            state.mentees = [];
            state.loading = false;
            state.serverError = null;
        }
    },
    extraReducers: (builder) => {
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
            });
    }
});

export const { clearMentees } = menteesSlice.actions;
export default menteesSlice.reducer;
