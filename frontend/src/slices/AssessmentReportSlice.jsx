import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    userAssessments: [],
    mentorAssessments: [],
    selectedReport: null,
    loading: false,
    reportLoading: false,
    serverError: null,
    reportError: null
};

// Fetch all assessments for student
export const fetchUserCompletedAssessments = createAsyncThunk(
    "assessmentReport/fetchUserCompletedAssessments",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/assessments");
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to fetch assessments"
            });
        }
    }
);

// Fetch all assessments for mentor
export const fetchMentorCompletedAssessments = createAsyncThunk(
    "assessmentReport/fetchMentorCompletedAssessments",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/assessment/mentor/all");
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to fetch mentor assessments"
            });
        }
    }
);

// Fetch or generate on-demand AI assessment report
export const fetchAssessmentReport = createAsyncThunk(
    "assessmentReport/fetchAssessmentReport",
    async (assessmentId, thunkAPI) => {
        try {
            const response = await axios.get(`/assessment/report/${assessmentId}`, {
                timeout: 120000 // 2 minutes for initial AI generation if needed
            });
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to load assessment report"
            });
        }
    }
);

// Delete pending assessment for mentor
export const deleteMentorAssessment = createAsyncThunk(
    "assessmentReport/deleteMentorAssessment",
    async (assessmentId, thunkAPI) => {
        try {
            const response = await axios.delete(`/assessment/${assessmentId}`);
            return { assessmentId, ...response.data };
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message: err.response?.data?.message || "Failed to delete assessment"
            });
        }
    }
);

const AssessmentReportSlice = createSlice({
    name: "assessmentReport",
    initialState,
    reducers: {
        clearSelectedReport: (state) => {
            state.selectedReport = null;
            state.reportError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Student assessments
            .addCase(fetchUserCompletedAssessments.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchUserCompletedAssessments.fulfilled, (state, action) => {
                state.loading = false;
                state.userAssessments = action.payload.data || [];
                state.serverError = null;
            })
            .addCase(fetchUserCompletedAssessments.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload?.message || "Failed to fetch assessments";
            })

            // Mentor assessments
            .addCase(fetchMentorCompletedAssessments.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(fetchMentorCompletedAssessments.fulfilled, (state, action) => {
                state.loading = false;
                state.mentorAssessments = action.payload.data || [];
                state.serverError = null;
            })
            .addCase(fetchMentorCompletedAssessments.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload?.message || "Failed to fetch mentor assessments";
            })

            // Fetch / Generate Report
            .addCase(fetchAssessmentReport.pending, (state) => {
                state.reportLoading = true;
                state.reportError = null;
            })
            .addCase(fetchAssessmentReport.fulfilled, (state, action) => {
                state.reportLoading = false;
                state.selectedReport = action.payload.data;
                state.reportError = null;
            })
            .addCase(fetchAssessmentReport.rejected, (state, action) => {
                state.reportLoading = false;
                state.reportError = action.payload?.message || "Failed to fetch assessment report";
            })

            // Delete Mentor Assessment
            .addCase(deleteMentorAssessment.fulfilled, (state, action) => {
                const deletedId = action.payload.assessmentId;
                state.mentorAssessments = state.mentorAssessments.filter(
                    (a) => String(a._id) !== String(deletedId)
                );
            });
    }
});

export const { clearSelectedReport } = AssessmentReportSlice.actions;
export default AssessmentReportSlice.reducer;
