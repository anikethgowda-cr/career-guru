import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../config/axios-config";

export const checkMentorAccess = createAsyncThunk(
    "payment/checkMentorAccess",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get("/payment/access");
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Failed to check mentor access"
            });
        }
    }
);

export const createPaymentOrder = createAsyncThunk(
    "payment/createPaymentOrder",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post("/payment/create-order");
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Failed to create payment order"
            });
        }
    }
);

export const verifyPayment = createAsyncThunk(
    "payment/verifyPayment",
    async (paymentData, { rejectWithValue }) => {
        try {
            const response = await axios.post("/payment/verify", paymentData);
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Payment verification failed"
            });
        }
    }
);

const initialState = {
    hasAccess: false,
    loading: true,
    error: null,
    paymentLoading: false
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        setMentorAccess: (state, action) => {
            state.hasAccess = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkMentorAccess.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkMentorAccess.fulfilled, (state, action) => {
                state.loading = false;
                state.hasAccess = action.payload.hasAccess;
            })
            .addCase(checkMentorAccess.rejected, (state, action) => {
                state.loading = false;
                state.hasAccess = false;
                state.error = action.payload;
            })
            .addCase(createPaymentOrder.pending, (state) => {
                state.paymentLoading = true;
                state.error = null;
            })
            .addCase(createPaymentOrder.fulfilled, (state) => {
                state.paymentLoading = false;
            })
            .addCase(createPaymentOrder.rejected, (state, action) => {
                state.paymentLoading = false;
                state.error = action.payload;
            })
            .addCase(verifyPayment.pending, (state) => {
                state.paymentLoading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state) => {
                state.paymentLoading = false;
                state.hasAccess = true;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.paymentLoading = false;
                state.error = action.payload;
            });
    }
});

export const { setMentorAccess } = paymentSlice.actions;

export default paymentSlice.reducer;