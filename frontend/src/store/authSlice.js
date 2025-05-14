import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../utils/axios";
import socket from "../socket";
import { addToast } from "./toastSlice";

const tokenFromStorage = localStorage.getItem("token");

const initialState = {
	userId: null,
	schoolId: null,
	first_name: null,
	last_name: null,
	email: null,
	role: null,
	token: tokenFromStorage || null,
	loading: false,
	error: null,
	isReady: false,
};

export const loginUser = createAsyncThunk(
	"auth/loginUser",
	async (credentials, { rejectWithValue }) => {
		try {
			const response = await axios.post("/auth/login", credentials);
			//console.log(response.data)
			return response.data;
		} catch (err) {
			return rejectWithValue(err.response.data.msg || "Login failed");
		}
	}
);

export const registerUser = createAsyncThunk(
	"auth/registerUser",
	async (data, { rejectWithValue }) => {
		try {
			const response = await axios.post("/auth/register", data);
			return response.data;
		} catch (err) {
			return rejectWithValue(
				err.response.data.msg || "Registration failed"
			);
		}
	}
);
export const loadUser = createAsyncThunk(
	"auth/loadUser",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get("/auth/refresh", {
				withCredentials: true,
			});
			const { token, user } = response.data;
			return { token: token, user: user };
		} catch (err) {
			// Silence the error unless it's unexpected
			if (err.response?.status !== 401) {
				console.log("Refresh error:", err);
			}
			return rejectWithValue("Not logged in");
		}
	}
);

export const googleLoginUser = createAsyncThunk(
	"auth/googleLoginUser",
	async (googleToken, { rejectWithValue }) => {
		try {
			const response = await axios.post(
				"/auth/google-login",
				{ token: googleToken },
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (err) {
			return rejectWithValue(err.response?.data || "Google login failed");
		}
	}
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			state.userId = null;
			state.schoolId = null;
			state.first_name = null;
			state.last_name = null;
			state.email = null;
			state.role = null;
			state.token = null;
			socket.disconnect();
			localStorage.removeItem("token");
		},
		setUser: (state, action) => {
			const { first_name, last_name, email, role, token } =
				action.payload;
			state.first_name = first_name;
			state.last_name = last_name;
			state.email = email;
			state.role = role;
			state.token = token;
		},
		setToken: (state, action) => {
			state.token = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.userId = action.payload.user.id;
				state.schoolId = action.payload.user.schoolId;
				state.token = action.payload.token;
				state.first_name = action.payload.user.first_name;
				state.last_name = action.payload.user.last_name;
				state.email = action.payload.user.email;
				state.role = action.payload.user.role;
				localStorage.setItem("token", action.payload.token);
				state.isReady = true;
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
				state.isReady = true;
			})

			.addCase(registerUser.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.loading = false;
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(loadUser.fulfilled, (state, action) => {
				state.token = action.payload.token;
				state.userId = action.payload.user.id;
				state.schoolId = action.payload.user.schoolId;
				state.first_name = action.payload.user.first_name;
				state.last_name = action.payload.user.last_name;
				state.email = action.payload.user.email;
				state.role = action.payload.user.role;
				localStorage.setItem("token", action.payload.token);
				state.isReady = true;
			})
			.addCase(loadUser.rejected, (state) => {
				state.token = null;
				state.role = null;
				localStorage.removeItem("token");
				state.isReady = true;
			})
			.addCase(googleLoginUser.fulfilled, (state, action) => {
				state.loading = false;
				state.userId = action.payload.user.id;
				state.schoolId = action.payload.user.schoolId;
				state.token = action.payload.token;
				state.first_name = action.payload.user.first_name;
				state.last_name = action.payload.user.last_name;
				state.email = action.payload.user.email;
				state.role = action.payload.user.role;
				localStorage.setItem("token", action.payload.token);
				state.isReady = true;
			})
			.addCase(googleLoginUser.rejected, (state) => {
				state.token = null;
				state.role = null;
				localStorage.removeItem("token");
				state.isReady = true;
			});
	},
});

export const { logout, setUser, setToken } = authSlice.actions;
export default authSlice.reducer;
