import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    data: null,
    loading: false,
    error: null,
    success: false
};

export const fetchProfileDetails = createAsyncThunk("profile/fetchProfileDetails", async (role, thunkAPI) => {
    const endPoint = role === "user" ? "/user/profile" : "/mentor/profile";

    try {
        const response = await axios.get(endPoint);
        return response.data;
    } catch (err) {
        return thunkAPI.rejectWithValue(
            err.response?.data?.message ||
            "Failed to fetch profile"
        );
    }
});

export const createProfile = createAsyncThunk("profile/createProfile", async ({profileData,role}, thunkAPI) => {
    console.log(role)

    const endPoint  = role === "user" ? "/user/profile" : "/mentor/profile"
        try {
            const response = await axios.post( endPoint,  profileData );
            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(
                err.response?.data?.message ||
                "Profile creation failed"
            );
        }
    }
);

const ProfileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfileState: (state) => {
            state.data = null;
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder

            // Fetch profile
            .addCase(fetchProfileDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchProfileDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.error = null;
            })

            .addCase(fetchProfileDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create profile
            .addCase(createProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })

            .addCase(createProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.data;
                state.error = null;
                state.success = true;
            })

            .addCase(createProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    }
});

export const { clearProfileState } = ProfileSlice.actions;

export default ProfileSlice.reducer;