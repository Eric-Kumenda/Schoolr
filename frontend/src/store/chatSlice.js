import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/axios";

export const fetchConversations = createAsyncThunk(
	"chat/fetchConversations",
	async (userId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`/chat/user/${userId}`);
			const data = response.data;
			//console.log(data)
			return data;
		} catch (error) {
			return rejectWithValue(
				error.message || "Failed to connect to the server."
			);
		}
	}
);

export const fetchCurrentChat = createAsyncThunk(
	"chat/fetchCurrentChat",
	async (convoId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`/chat/conversation/${convoId}`);
			const data = response.data;
			//console.log(data);
			return data;
		} catch (error) {
			return rejectWithValue(
				error.message || "Failed to connect to the server."
			);
		}
	}
);

export const markMessagesAsRead = createAsyncThunk(
    "chat/markMessagesAsRead",
    async ({ convoId, messageIds, userId }, { rejectWithValue }) => {
        try {
            // Assuming you have a backend API endpoint to mark messages as read
            const response = await axios.post(`/chat/conversation/${convoId}/read`, {
                messageIds,
				userId
            });
            const data = response.data;
            // Optionally, you might want to return some data from the server
            console.log(data)
			return data;
        } catch (error) {
            return rejectWithValue(
                error.message || "Failed to mark messages as read."
            );
        }
    }
);

const chatSlice = createSlice({
	name: "chat",
	initialState: {
		conversations: [],
		currentChat: null,
		currentChatLoading: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
		loading: "idle", // 'idle' | 'pending' | 'succeeded' | 'failed'
		error: null,
		currentOutgoingCall: {},
	},
	reducers: {
		setCurrentOutgoingCall: (state, action) => {
			state.currentOutgoingCall = action.payload;
		},
		addMessage: (state, action) => {
			state.currentChat.messages.push(action.payload);
		},
        markMessagesAsReadLocally: (state, action) => {
            const { convoId, messageIds } = action.payload;
            if (state.currentChat && state.currentChat.conversation_id === convoId) {
                state.currentChat.messages = state.currentChat.messages.map(message =>
                    messageIds.includes(message._id) ? { ...message, read: true } : message
                );
            }
        },
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchConversations.pending, (state) => {
				state.loading = "pending";
				state.error = null;
			})
			.addCase(fetchConversations.fulfilled, (state, action) => {
				state.loading = "succeeded";
				state.conversations = action.payload.conversations;
			})
			.addCase(fetchConversations.rejected, (state, action) => {
				state.loading = "failed";
				state.error = action.payload;
			})
			.addCase(fetchCurrentChat.pending, (state) => {
				state.currentChatLoading = "pending";
				state.error = null;
			})
			.addCase(fetchCurrentChat.fulfilled, (state, action) => {
				state.currentChatLoading = "succeeded";
				state.currentChat = action.payload;
			})
			.addCase(fetchCurrentChat.rejected, (state, action) => {
				state.currentChatLoading = "failed";
				state.error = action.payload;
			})
            .addCase(markMessagesAsRead.pending, (state) => {
                // You might want to set a loading state for marking as read
            })
            .addCase(markMessagesAsRead.fulfilled, (state, action) => {
                // Optionally handle success (e.g., display a notification)
            })
            .addCase(markMessagesAsRead.rejected, (state, action) => {
                state.error = action.payload;
                // Optionally handle error (e.g., show an error message)
            });
	},
});

export const { setCurrentOutgoingCall, addMessage, markMessagesAsReadLocally } = chatSlice.actions;
export default chatSlice.reducer;
