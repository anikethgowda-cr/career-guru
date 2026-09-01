import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    data: null,
    loading: true,
    generating: false,
    serverError: null
};

export const fetchInterviewQuestions = createAsyncThunk("interviewQuestions/fetchInterviewQuestions",async (_, thunkAPI) => {
        try {
            const response = await axios.get( "/interview-questions" );
            return response.data;

        }catch (err) {
            if (err.response?.status === 404) {
                return {
                    noQuestions: true,
                    data: null
                };
            }
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch interview questions"
            });
        }
    }
);

export const generateInterviewQuestions = createAsyncThunk( "interviewQuestions/generateInterviewQuestions",async ({ difficulty }, thunkAPI) => {
        try {
            const response = await axios.post("/interview-questions/generate",{questionDifficulty: difficulty});
            return response.data;

        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    "Failed to generate interview questions"
            });
        }
    }
);

const InterviewQuestionsSlice = createSlice({
    name: "interviewQuestions",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase( fetchInterviewQuestions.pending, (state) => {
                    state.loading = true;
                    state.serverError = null;
                }
            )
            .addCase( fetchInterviewQuestions.fulfilled, (state, action) => {
                    state.loading = false;
                    state.serverError = null;

                    if (action.payload.noQuestions) {
                        state.data = null;
                        return;
                    }
                    state.data = action.payload.data;
                }
            )
            .addCase( fetchInterviewQuestions.rejected, (state, action) => {
                    state.loading = false;
                    state.serverError = action.payload;
                }
            )


            .addCase( generateInterviewQuestions.pending, (state) => {
                    state.generating = true;
                    state.serverError = null;
                }
            )
            .addCase( generateInterviewQuestions.fulfilled, (state, action) => {
                    state.generating = false;
                    state.serverError = null;
                    state.data = action.payload.data;
                }
            )
            .addCase( generateInterviewQuestions.rejected,(state, action) => {
                    state.generating = false;
                    state.serverError = action.payload;
                }
            );
        }
});

export default InterviewQuestionsSlice.reducer;