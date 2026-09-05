import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../config/axios-config";

const initialState = {
    conversations: [],
    conversation: null,
    messages: [],
    loading: false,
    conversationsLoading: false,
    messagesLoading: false,
    serverError: null
};

export const createConversation = createAsyncThunk(
    "mentorChat/createConversation",
    async (mentorId, thunkAPI) => {
        try {
            const response = await axios.post("/conversations", {
                mentorId
            });

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:
                    err.response?.data?.message ||
                    "Failed to create conversation"
            });
        }
    }
);

export const fetchConversations = createAsyncThunk(
    "mentorChat/fetchConversations",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("/conversations");

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch conversations"
            });
        }
    }
);

export const fetchMessages = createAsyncThunk(
    "mentorChat/fetchMessages",
    async (conversationId, thunkAPI) => {
        try {
            const response = await axios.get(
                `/conversations/${conversationId}/messages`
            );

            return response.data;
        } catch (err) {
            return thunkAPI.rejectWithValue({
                status: err.response?.status,
                message:
                    err.response?.data?.message ||
                    "Failed to fetch messages"
            });
        }
    }
);

const mentorChatSlice = createSlice({
    name: "mentorChat",
    initialState,
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },

        clearChat: (state) => {
            state.conversation = null;
            state.messages = [];
            state.loading = false;
            state.messagesLoading = false;
            state.serverError = null;
        }
    },

    extraReducers: (builder) => {
        builder

            .addCase(createConversation.pending, (state) => {
                state.loading = true;
                state.serverError = null;
            })

            .addCase(createConversation.fulfilled, (state, action) => {
                state.loading = false;
                state.conversation = action.payload.data;
                state.serverError = null;
            })

            .addCase(createConversation.rejected, (state, action) => {
                state.loading = false;
                state.serverError = action.payload;
            })

            .addCase(fetchConversations.pending, (state) => {
                state.conversationsLoading = true;
                state.serverError = null;
            })

            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversationsLoading = false;
                state.conversations = action.payload.data;
                state.serverError = null;
            })

            .addCase(fetchConversations.rejected, (state, action) => {
                state.conversationsLoading = false;
                state.serverError = action.payload;
            })

            .addCase(fetchMessages.pending, (state) => {
                state.messagesLoading = true;
                state.serverError = null;
            })

            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messagesLoading = false;
                state.messages = action.payload.data;
                state.serverError = null;
            })

            .addCase(fetchMessages.rejected, (state, action) => {
                state.messagesLoading = false;
                state.serverError = action.payload;
            });
    }
});

export const { addMessage, clearChat } = mentorChatSlice.actions;

export default mentorChatSlice.reducer;