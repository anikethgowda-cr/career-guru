import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

const initialState = {
    assessment: null,
    mentees: [],
    generatedQuestions: [],
    message: null,
    loading: false,
    isSubmitting: false,
    isGenerating: false,
    serverError: null
};

export const createAssessmentManually = createAsyncThunk(
    "mentorAssessment/createAssessmentManually",
    async (formData, thunkAPI) => {
        try {
            const response = await axios.post("/assessment/manual", formData);
            return response.data;
        } catch (err) {
            console.error("Create assessment manual error:", err);
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to create manual assessment"
            });
        }
    }
);

export const fetchMentees = createAsyncThunk(
    "mentees/fetchMentees",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/mentor/mentees");
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to fetch mentees"
            });
        }
    }
);

export const generateAiQuestions = createAsyncThunk(
    "mentorAssessment/generateAiQuestions",
    async (questionsData, thunkAPI) => {
        try {
            const response = await axios.post("/assessment/aiQuestions", questionsData);
            return response.data;
        } catch (err) {
            console.error("Generate AI questions error:", err);
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to generate AI questions"
            });
        }
    }
);

export const createAiAssessment = createAsyncThunk(
    "mentorAssessment/createAiAssessment",
    async (assessmentData, thunkAPI) => {
        try {
            const response = await axios.post("/assessment/ai", assessmentData);
            return response.data;
        } catch (err) {
            console.error("Create AI assessment error:", err);
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to create AI assessment"
            });
        }
    }
);

const mentorAssessmentSlice = createSlice({
    name: "mentorAssessment",
    initialState,
    reducers: {
        clearMentorAssessmentState: (state) => {
            state.message = null;
            state.serverError = null;
        },
        clearGeneratedQuestions: (state) => {
            state.generatedQuestions = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Mentees
            .addCase(fetchMentees.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchMentees.fulfilled, (state, action) => {
                state.loading = false;
                state.mentees = action.payload?.data || [];
                state.serverError = null;
            })
            .addCase(fetchMentees.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            })

            // Generate AI Questions
            .addCase(generateAiQuestions.pending, (state) => {
                state.isGenerating = true;
                state.serverError = null;
            })
            .addCase(generateAiQuestions.fulfilled, (state, action) => {
                state.isGenerating = false;
                state.generatedQuestions = action.payload?.data || [];
                state.message = action.payload?.message || "Questions generated successfully!";
                state.serverError = null;
            })
            .addCase(generateAiQuestions.rejected, (state, action) => {
                state.isGenerating = false;
                state.serverError = action.payload;
            })

            // Create Assessment Manually
            .addCase(createAssessmentManually.pending, (state) => {
                state.isSubmitting = true;
                state.serverError = null;
            })
            .addCase(createAssessmentManually.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.assessment = action.payload?.data;
                state.message = action.payload?.message || "Assessment created successfully!";
                state.serverError = null;
            })
            .addCase(createAssessmentManually.rejected, (state, action) => {
                state.isSubmitting = false;
                state.serverError = action.payload;
            })

            // Create AI Assessment
            .addCase(createAiAssessment.pending, (state) => {
                state.isSubmitting = true;
                state.serverError = null;
            })
            .addCase(createAiAssessment.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.assessment = action.payload?.data;
                state.message = action.payload?.message || "AI assessment created successfully!";
                state.serverError = null;
            })
            .addCase(createAiAssessment.rejected, (state, action) => {
                state.isSubmitting = false;
                state.serverError = action.payload;
            });
    }
});

export const { clearMentorAssessmentState, clearGeneratedQuestions } =
    mentorAssessmentSlice.actions;

export default mentorAssessmentSlice.reducer;