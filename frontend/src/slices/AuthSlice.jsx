import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    isLoggedIn: false,
    user: null,
    loading: true,
    serverError: null
};

export const checkAuth = createAsyncThunk( "auth/checkAuth", async (_, thunkAPI) => {
        try {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");
            if (!token || !role) {
                return {
                    isLoggedIn: false,
                    user: null
                };
            }

            const endpoint = role === "user" ? "/user/me" : "/mentor/me";
            const response = await axios.get(endpoint);

            return {
                isLoggedIn: true,
                user: response.data.data
            };

        } catch (err) {

            localStorage.removeItem("token");
            localStorage.removeItem("role");

            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    "Authentication failed"
            });
        }
    }
);

export const loginUser = createAsyncThunk( "auth/loginUser", async ({ formData, role }, thunkAPI) => {
        try {
            const loginEndpoint =  role === "user"  ? "/user/login" : "/mentor/login";
            const response = await axios.post( loginEndpoint,formData );

            localStorage.setItem( "token", response.data.token );
            localStorage.setItem( "role", role  );

            const userEndpoint = role === "user" ? "/user/me" : "/mentor/me";
            const profileEndpoint = role === "user" ? "/user/profile" : "/mentor/profile";

            const userResponse = await axios.get(userEndpoint);

            const profileResponse = await axios.get(profileEndpoint);

            return {
                user: userResponse.data.data,
                hasProfile: profileResponse.data.hasProfile
            };

        } catch (err) {

            return thunkAPI.rejectWithValue({
                status: err.response?.status || 500,
                message:
                    err.response?.data?.message ||
                    "Something went wrong"
            });
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            state.isLoggedIn = false;
            state.user = null;
            state.serverError = null;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = action.payload.isLoggedIn;
                state.user = action.payload.user;
                state.serverError = null;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.isLoggedIn = false;
                state.user = null;
                state.serverError = action.payload;
            })

            
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isLoggedIn = true;
                state.user = action.payload.user;
                state.serverError = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isLoggedIn = false;
                state.user = null;
                state.serverError = action.payload;
            });
        }
    });

export const { logout } = authSlice.actions;

export default authSlice.reducer;

