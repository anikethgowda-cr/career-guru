import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    data: null,
    analysis: null,

    uploadLoading: false,
    analysisLoading: false,

    uploadError: null,
    analysisError: null,

    uploadSuccess: false,
    analysisSuccess: false
};

export const uploadResume = createAsyncThunk( "resume/uploadResume", async (resumeFile, thunkAPI) => {
        try {
            const resumeData = new FormData();
            resumeData.append("resume", resumeFile);

            const response = await axios.post(  "/resume/upload",   resumeData  );
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message ||
                "Resume upload failed"
            );
        }
    }
);

export const analyzeResume = createAsyncThunk(  "resume/analyzeResume",async({ preferredJobRole,preferredSpecialization},thunkAPI)=>{
        try {
            const response = await axios.post( "/resume/analyze",{preferredJobRole,preferredSpecialization});
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message ||
                "Resume analysis failed"
            );
        }
    }
);

const ResumeSlice = createSlice({
    name: "resume",
    initialState,
    reducers: {
        clearResumeState: (state) => {
            state.data = null;
            state.analysis = null;

            state.uploadLoading = false;
            state.analysisLoading = false;

            state.uploadError = null;
            state.analysisError = null;

            state.uploadSuccess = false;
            state.analysisSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Upload resume
            .addCase(uploadResume.pending, (state) => {
                state.uploadLoading = true;
                state.uploadError = null;
                state.uploadSuccess = false;
            })

            .addCase(uploadResume.fulfilled, (state, action) => {
                state.uploadLoading = false;
                state.uploadSuccess = true;
                state.uploadError = null;
                state.data = action.payload.data;
            })

            .addCase(uploadResume.rejected, (state, action) => {
                state.uploadLoading = false;
                state.uploadSuccess = false;
                state.uploadError = action.payload;
            })

            // Analyze resume
            .addCase(analyzeResume.pending, (state) => {
                state.analysisLoading = true;
                state.analysisError = null;
                state.analysisSuccess = false;
            })

            .addCase(analyzeResume.fulfilled, (state, action) => {
                state.analysisLoading = false;
                state.analysisSuccess = true;
                state.analysisError = null;
                state.analysis = action.payload.data;
            })

            .addCase(analyzeResume.rejected, (state, action) => {
                state.analysisLoading = false;
                state.analysisSuccess = false;
                state.analysisError = action.payload;
            });
    }
});

export const { clearResumeState } = ResumeSlice.actions;

export default ResumeSlice.reducer;