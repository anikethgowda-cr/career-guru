import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    mentors: null,
    loading: true,
    serverError: null
};

export const fetchMentors = createAsyncThunk("mentors/fetchMentors", async (_, thunkAPI) => {
    try {
        const response = await axios.get("/mentors");
        console.log(response.data);
        return response.data;
    } catch (err) {
        console.log(err.response?.data?.message);

        return thunkAPI.rejectWithValue({
            status: err.response?.status,
            message: err.response?.data?.message || "Failed to fetch mentors"
        });
    }
});

const mentorsSlice = createSlice({
    name: "mentors",
    initialState,
    reducers: {
        clearMentors: (state) => {
            state.mentors = null;
            state.loading = true;
            state.serverError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMentors.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchMentors.fulfilled, (state, action) => {
                state.loading = false;
                state.mentors = action.payload.mentors;
                state.serverError = null;
            })
            .addCase(fetchMentors.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            });
    }
});

export const { clearMentors } = mentorsSlice.actions;

export default mentorsSlice.reducer;