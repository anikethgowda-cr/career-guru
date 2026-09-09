import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

const initialState = {
    mentees: [],
    report:null,
    loading: false,
    reportLoading:false,
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

export const fetchReport = createAsyncThunk("mentees/fetchReport",async(studentId , thunkAPI)=>{
    try{
        const response = await axios.post(`/mentor/userReport/${studentId}`)
        
        return response.data

    }catch(err){
        console.log(err.response.data.message)
        
        return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch Report"
            })
    }
})

const menteesSlice = createSlice({
    name: "mentees",
    initialState,
    reducers: {
        clearMentees: (state) => {
            state.mentees = [];
            state.loading = false;
            state.serverError = null;
        },
        clearReportServerError:(state)=>{
            state.serverError = null
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
            })
            .addCase(fetchReport.pending,(state)=>{
                state.report=null,
                state.reportLoading=true,
                state.serverError=null
            })
            .addCase(fetchReport.fulfilled,(state,action)=>{
                state.reportLoading= false
                state.report=action.payload.report
                state.serverError=null
            })
            .addCase(fetchReport.rejected,(state,action)=>{
                state.reportLoading=false
                state.serverError=action.payload
            })
    }
});

export const { clearMentees,clearReportServerError } = menteesSlice.actions;
export default menteesSlice.reducer;
