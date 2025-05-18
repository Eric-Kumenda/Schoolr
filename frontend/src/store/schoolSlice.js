import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../utils/axios";

const initialState = {
	school: null,
	studentsData: null,
	selectedStudent: null,
	selectedTeacher: null,
	loading: false,
	error: null,
	schoolMetrics: { totalStudents: null, totalTeachers: null },
	fetchSchoolMetricsLoading: false,
	fetchSchoolMetricsError: null,
	uploadStudentDataLoading: false,
	uploadTeacherDataLoading: false,
	fetchSchoolStudentsLoading: false,
	fetchSchoolStudentsError: null,
	teachersData: [],
	fetchSchoolTeachersLoading: false,
	fetchSchoolTeachersError: null,
};

export const fetchSchoolMetrics = createAsyncThunk(
	"/school/fetchSchoolMetrics",
	async (schoolId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`/school/fetch/${schoolId}`, {
				withCredentials: true,
			});
			return response.data; // Expect an array of student objects
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "Failed to fetch school metrics."
			);
		}
	}
);

export const createSchoolProfile = createAsyncThunk(
	"/school/schoolCreate",
	async (schoolData, { rejectWithValue }) => {
		try {
			// Perform the API request
			const response = await axios.post("/school/create", schoolData, {
				withCredentials: true,
			});

			return response.data; // This will return the response from the backend
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "School creation failed"
			);
		}
	}
);

export const getSchoolProfile = createAsyncThunk(
	"/auth/schoolGet",
	async (schoolCode, { rejectWithValue }) => {
		try {
			// Perform the API request
			const response = await axios.post("/school/getInfo", schoolCode, {
				withCredentials: true,
			});

			return response.data; // response from the backend
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "School Info Request failed"
			);
		}
	}
);

export const uploadStudentData = createAsyncThunk(
	"/school/uploadStudents",
	async ({ students, schoolId, cohort }, { rejectWithValue }) => {
		try {
			const response = await axios.post(
				"/school/upload-students",
				{ students, schoolId, cohort },
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.message || "Failed to upload student data."
			);
		}
	}
);

export const uploadTeacherData = createAsyncThunk(
	"/school/uploadTeachers",
	async ({ teachersData, schoolId }, { rejectWithValue }) => {
		try {
			const response = await axios.post(
				"/school/upload-teachers",
				{ teachersData, schoolId },
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.message || "Failed to upload teacher data."
			);
		}
	}
);

export const fetchSchoolStudents = createAsyncThunk(
	"/school/fetchStudents",
	async (schoolId, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				`/school/students/fetch/${schoolId}`,
				{
					withCredentials: true,
				}
			);
			return response.data; // Expect an array of student objects
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "Failed to fetch school students."
			);
		}
	}
);

export const fetchSchoolTeachers = createAsyncThunk(
	"school/fetchSchoolTeachers",
	async (schoolId, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				`/school/teachers/fetch/${schoolId}`,
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "Failed to fetch school teachers."
			);
		}
	}
);

export const updateSchoolStudent = createAsyncThunk(
	"/school/updateStudent",
	async (studentData, { rejectWithValue }) => {
		try {
			const response = await axios.put(
				`/school/students/update/${studentData.adm_no}`,
				studentData,
				{
					withCredentials: true,
				}
			);
			return response.data; // Assuming your backend returns the updated student object
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "Failed to update student."
			);
		}
	}
);

export const updateSchoolTeacher = createAsyncThunk(
	"school/updateTeacher",
	async ({ teacherData, schoolId }, { rejectWithValue }) => {
		try {
			const response = await axios.put(
				`/school/teachers/update/${schoolId}`,
				{ teacherData },
				{
					withCredentials: true,
				}
			);
			return response.data;
		} catch (err) {
			return rejectWithValue(
				err.response?.data?.msg || "Failed to update teacher."
			);
		}
	}
);

const schoolSlice = createSlice({
	name: "school",
	initialState,
	reducers: {
		setSelectedStudent: (state, action) => {
			state.selectedStudent = action.payload;
		},
		setSelectedTeacher: (state, action) => {
			state.selectedTeacher = action.payload;
		},
	},
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
			.addCase(uploadStudentData.pending, (state) => {
				state.uploadStudentDataLoading = true;
				state.uploadStudentDataError = null;
			})
			.addCase(uploadStudentData.fulfilled, (state, action) => {
				state.uploadStudentDataLoading = false;
			})
			.addCase(uploadStudentData.rejected, (state, action) => {
				state.uploadStudentDataLoading = false;
			})
			.addCase(uploadTeacherData.pending, (state) => {
				state.uploadTeacherDataLoading = "pending";
				state.error = null;
			})
			.addCase(uploadTeacherData.fulfilled, (state, action) => {
				state.uploadTeacherDataLoading = "succeeded";
				// Optionally update state
			})
			.addCase(uploadTeacherData.rejected, (state, action) => {
				state.uploadTeacherDataLoading = "failed";
				state.error = action.payload;
			})
			.addCase(fetchSchoolStudents.pending, (state) => {
				state.fetchSchoolStudentsLoading = true;
				state.fetchSchoolStudentsError = null;
				state.studentsData = null;
			})
			.addCase(fetchSchoolStudents.fulfilled, (state, action) => {
				state.studentsData = action.payload.students;
				state.fetchSchoolStudentsLoading = false;
			})
			.addCase(fetchSchoolStudents.rejected, (state, action) => {
				state.fetchSchoolStudentsError = action.payload;
				state.studentsData = null;
				state.fetchSchoolStudentsLoading = false;
			})
			.addCase(updateSchoolStudent.pending, (state) => {
				//state.loading = 'pending';
				//state.error = null;
			})
			.addCase(updateSchoolStudent.fulfilled, (state, action) => {
				//state.loading = 'succeeded';
				// Optionally, update the studentsData in the store if needed
				// You might want to find and replace the updated student in your local array
				const updatedStudent = action.payload.updatedStudent;
				if (state.studentsData) {
					state.studentsData = state.studentsData.map((cohort) => ({
						...cohort,
						students: cohort.students.map((student) =>
							student._id === updatedStudent._id
								? updatedStudent
								: student
						),
					}));
				}
				state.selectedStudent = updatedStudent; // Update the selected student in the store
			})
			.addCase(updateSchoolStudent.rejected, (state, action) => {
				//state.loading = 'failed';
				//state.error = action.payload;
			})
			.addCase(fetchSchoolTeachers.pending, (state) => {
				state.fetchSchoolTeachersLoading = true;
				state.fetchSchoolTeachersError = null;
			})
			.addCase(fetchSchoolTeachers.fulfilled, (state, action) => {
				state.fetchSchoolTeachersLoading = false;
				state.teachersData = action.payload.teachers;
			})
			.addCase(fetchSchoolTeachers.rejected, (state, action) => {
				state.fetchSchoolTeachersLoading = false;
				state.fetchSchoolTeachersError = action.payload;
			})
			.addCase(fetchSchoolMetrics.pending, (state) => {
				state.fetchSchoolMetricsLoading = true;
				state.fetchSchoolMetricsError = null;
			})
			.addCase(fetchSchoolMetrics.fulfilled, (state, action) => {
				state.fetchSchoolMetricsLoading = false;
				state.schoolMetrics.totalStudents =
					action.payload.totalStudents;
				state.schoolMetrics.totalTeachers =
					action.payload.totalTeachers;
			})
			.addCase(fetchSchoolMetrics.rejected, (state, action) => {
				state.fetchSchoolMetricsLoading = false;
				state.fetchSchoolMetricsError = action.payload;
			});
	},
});

export const { setSelectedStudent, setSelectedTeacher } = schoolSlice.actions;
export default schoolSlice.reducer;
