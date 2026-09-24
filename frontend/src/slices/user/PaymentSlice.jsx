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
    async ({ mentorId }, { rejectWithValue }) => {
        try {
            const response = await axios.post("/payment/create-order", { mentorId });
            return response.data;
        } catch (err) {
            return rejectWithValue({
                status: err.response?.status,
                message: err.response?.data?.message || "Failed to create payment order",
                endDate: err.response?.data?.endDate || null
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
    paymentLoading: false,
    duplicateSubscription: null  // { message, endDate } when already subscribed
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
                state.duplicateSubscription = null;
            })
            .addCase(createPaymentOrder.rejected, (state, action) => {
                state.paymentLoading = false;
                // 400 = already has active subscription
                if (action.payload?.status === 400 && action.payload?.endDate) {
                    state.duplicateSubscription = {
                        message: action.payload.message,
                        endDate: action.payload.endDate
                    };
                } else {
                    state.error = action.payload;
                }
            })
            .addCase(verifyPayment.pending, (state) => {
                state.paymentLoading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state) => {
                state.paymentLoading = false;
                state.hasAccess = true;
                state.loading = false;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.paymentLoading = false;
                state.error = action.payload;
            });
    }
});

export const { setMentorAccess } = paymentSlice.actions;

export default paymentSlice.reducer;