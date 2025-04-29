import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '../utils/axios'

const initialState = {
  school: null,
  loading: false,
  error: null,
};


export const createSchoolProfile = createAsyncThunk(
  '/auth/schoolCreate',
  async (schoolData, { rejectWithValue }) => {
    try {
      // Perform the API request
      const response = await axios.post("/school/create", schoolData, {
        withCredentials: true,
      });

      return response.data; // This will return the response from the backend
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'School creation failed');
    }
  }
);

export const getSchoolProfile = createAsyncThunk(
  '/auth/schoolGet',
  async (schoolCode, { rejectWithValue }) => {
    try {
      // Perform the API request
      const response = await axios.post("/school/getInfo", schoolCode, {
        withCredentials: true,
      });

      return response.data; // This will return the response from the backend
    } catch (err) {
      return rejectWithValue(err.response?.data?.msg || 'School Info Request failed');
    }
  }
);

const schoolSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    .addCase(createSchoolProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(createSchoolProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.school = action.payload; // Store the created school data
    })
    .addCase(createSchoolProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload; // Store error message
    })
    .addCase(getSchoolProfile.pending, (state) => {
      state.loading = true;
    })
    .addCase(getSchoolProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.school = action.payload.school; // Store the created school data
    })
    .addCase(getSchoolProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload; // Store error message
    })
  },
});

export default schoolSlice.reducer;
