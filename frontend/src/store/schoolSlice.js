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

	exams: [], // To store list of exams
	selectedExam: null, // To store details of a selected exam
	studentsForResultsEntry: [], // Students for results input
	studentExamResults: [], // Results for a single student
	examOverviewResults: [], // All results for a specific exam
	examsLoading: "idle",
	examsError: null,

	studentsForAttendance: [], // Students list for attendance taking
	monthlyAttendanceSummary: [], // Data for admin dashboard chart
	studentAttendanceSummary: null, // Summary for a single student
	attendanceLoading: "idle",
	attendanceError: null,

	cohortExamPerformance: null, // New state to store the chart data
	cohortExamPerformanceLoading: "idle",
	cohortExamPerformanceError: null,

	dailyAttendancePercentage: null, // New state for attendance chart data
	dailyAttendancePercentageLoading: "idle",
	dailyAttendancePercentageError: null,

	examsList: [], // New state to store list of exams for dropdown
	examsListLoading: "idle",
	examsListError: null,

	studentExamResults: [], // New state to store student's results for selected exam
	studentExamResultsLoading: "idle",
	studentExamResultsError: null,
	selectedExamId: null, // To keep track of the currently selected exam

	studentFinanceDetails: {
		// New state for student finance details
		accountBalance: 0,
		transactions: [],
	},
	studentFinanceDetailsLoading: "idle",
	studentFinanceDetailsError: null,
	schoolPaymentDetails: {}, // New state for school payment details
	schoolPaymentDetailsLoading: "idle",
	schoolPaymentDetailsError: null,

	updateSchoolPaymentDetailsLoading: "idle", // New state for update operation loading
	updateSchoolPaymentDetailsError: null,
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
				`/school/students/update/${studentData._id}`,
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
	async (teacherData, { rejectWithValue }) => {
		try {
			const response = await axios.put(
				`/school/teachers/update/${teacherData._id}`,
				teacherData,
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

// --- New Thunks for Exam Module ---

// Admin: Create New Exam
export const createExam = createAsyncThunk(
	"exams/createExam",
	async (examData, { rejectWithValue }) => {
		try {
			const response = await axios.post("/exams/create", examData);
			return response.data; // Expecting { message, exam }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || "Failed to create exam."
			);
		}
	}
);

// Admin/Teacher: Get list of all Exams for a school
export const getExams = createAsyncThunk(
	"exams/getExams",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get("/exams/list");
			return response.data; // Expecting { exams: [] }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || "Failed to fetch exams list."
			);
		}
	}
);

// Admin/Teacher: Get Students and their existing results for a specific exam
export const getStudentsForResultsEntry = createAsyncThunk(
	"exams/getStudentsForResultsEntry",
	async ({ examId, cohort, stream }, { rejectWithValue }) => {
		try {
			// Build query parameters
			const params = new URLSearchParams();
			if (cohort) params.append("cohort", cohort);
			if (stream) params.append("stream", stream);

			const response = await axios.get(
				`/exams/${examId}/students-for-entry`,
				{ params }
			);
			return response.data; // Expecting { students: [] }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to fetch students for results entry."
			);
		}
	}
);

// Admin/Teacher: Update a single student's result for a subject in a specific exam
export const updateStudentResult = createAsyncThunk(
	"exams/updateStudentResult",
	async ({ examId, studentId, resultData }, { rejectWithValue }) => {
		try {
			const response = await axios.put(
				`/exams/${examId}/students/${studentId}/results`,
				resultData
			);
			return response.data; // Expecting { message, result }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to update student result."
			);
		}
	}
);

// Admin: Set Exam Status to Official
export const setExamOfficial = createAsyncThunk(
	"exams/setExamOfficial",
	async (examId, { rejectWithValue }) => {
		try {
			const response = await axios.put(`/exams/${examId}/official`);
			return response.data; // Expecting { message, exam }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || "Failed to set exam official."
			);
		}
	}
);

// All Authorized Roles: Get a specific student's exam results
export const getStudentExamResults = createAsyncThunk(
	"exams/getStudentExamResults",
	async ({ studentId, examId }, { rejectWithValue }) => {
		// examId is optional
		try {
			const params = new URLSearchParams();
			if (examId) params.append("examId", examId);

			const response = await axios.get(
				`/exams/students/${studentId}/exam-results`,
				{ params }
			);
			return response.data; // Expecting { studentResults: [] }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to fetch student exam results."
			);
		}
	}
);

// Admin/Teacher: Get all results for a specific exam (for overview/reporting)
export const getExamResultsByExamId = createAsyncThunk(
	"exams/getExamResultsByExamId",
	async (examId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`/exams/${examId}/all-results`);
			return response.data; // Expecting { exam, results: [] }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to fetch exam overview results."
			);
		}
	}
);

// --- ATTENDANCE ---
// Teacher/Admin: Get Students for Attendance Taking
export const getStudentsForAttendance = createAsyncThunk(
	"attendance/getStudentsForAttendance",
	async ({ attendanceDate, cohort, stream }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams({ attendanceDate });
			if (cohort) params.append("cohort", cohort);
			if (stream) params.append("stream", stream);

			const response = await axios.get("/attendance/students-for-entry", {
				params,
			});
			return response.data; // Expecting { students: [] }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to fetch students for attendance."
			);
		}
	}
);

// Teacher/Admin: Record/Update Batch Attendance
export const recordBatchAttendance = createAsyncThunk(
	"attendance/recordBatchAttendance",
	async ({ attendanceDate, attendanceData }, { rejectWithValue }) => {
		try {
			const response = await axios.post("/attendance/batch", {
				attendanceDate,
				attendanceData,
			});
			return response.data; // Expecting { message, bulkWriteResult, updatedStudentSummaries }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to record batch attendance."
			);
		}
	}
);

// Admin: Get Monthly Attendance Summary for Chart
export const getMonthlyAttendanceSummary = createAsyncThunk(
	"attendance/getMonthlyAttendanceSummary",
	async ({ year, month }, { rejectWithValue }) => {
		try {
			const params = new URLSearchParams({ year, month });
			const response = await axios.get("/attendance/monthly-summary", {
				params,
			});
			return response.data; // Expecting { summary: [] }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to fetch monthly attendance summary."
			);
		}
	}
);

// All Authorized Roles: Get a specific student's attendance summary
export const getStudentAttendanceSummary = createAsyncThunk(
	"attendance/getStudentAttendanceSummary",
	async (studentId, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				`/attendance/students/${studentId}/attendance-summary`
			);
			return response.data; // Expecting { studentId, adm_no, name, summary }
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message ||
					"Failed to fetch student attendance summary."
			);
		}
	}
);

// New Thunk for fetching cohort exam performance
export const getCohortExamPerformance = createAsyncThunk(
	"school/getCohortExamPerformance",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get("/exams/cohort-performance"); // Adjust API endpoint path if different
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.message
			);
		}
	}
);

// New Thunk for fetching daily attendance percentage
export const getDailyAttendancePercentage = createAsyncThunk(
	"school/getDailyAttendancePercentage",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get("/attendance/daily-percentage"); // Adjust API endpoint path
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.message
			);
		}
	}
);

// New Thunk for fetching list of exams for dropdown
export const getExamsListForDropdown = createAsyncThunk(
	"school/getExamsListForDropdown",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get("/exams/list-for-dropdown"); // Adjust API endpoint path
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.message
			);
		}
	}
);

// New Thunk for fetching student's exam results for a specific exam
export const getStudentExamResultsForExam = createAsyncThunk(
	"school/getStudentExamResultsForExam",
	async ({ studentId, examId }, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				`/exams/student/${studentId}/results/${examId}`
			); // Adjust API endpoint path
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.message
			);
		}
	}
);

// New Thunk for fetching student's finance details
export const getStudentFinanceDetails = createAsyncThunk(
	"school/getStudentFinanceDetails",
	async (studentId, { rejectWithValue }) => {
		try {
			const response = await axios.get(`/finance/${studentId}/finance`); // Adjust API endpoint path
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.message
			);
		}
	}
);

// New Thunk for fetching school payment details
export const getSchoolPaymentDetails = createAsyncThunk(
	"school/getSchoolPaymentDetails",
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get("/school/payment-details"); // Adjust API endpoint path
			return response.data;
		} catch (error) {
			return rejectWithValue(
				error.response?.data?.message || error.message
			);
		}
	}
);

// New Thunk for updating school payment details
export const updateSchoolPaymentDetails = createAsyncThunk(
    'school/updateSchoolPaymentDetails',
    async ({ paymentDetails }, { rejectWithValue }) => {
        try {
            const response = await axios.put('/school/payment-details', { paymentDetails }); // Adjust API endpoint path
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
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
		clearExamState: (state) => {
			// Utility to clear exam-related data
			state.exams = [];
			state.selectedExam = null;
			state.studentsForResultsEntry = [];
			state.studentExamResults = [];
			state.examOverviewResults = [];
			state.examsLoading = "idle";
			state.examsError = null;
		},
		clearSelectedExamData: (state) => {
			state.studentsForResultsEntry = [];
			state.examOverviewResults = [];
		},
		clearAttendanceState: (state) => {
			state.studentsForAttendance = [];
			state.monthlyAttendanceSummary = [];
			state.studentAttendanceSummary = null;
			state.attendanceLoading = "idle";
			state.attendanceError = null;
		},

		clearCohortExamPerformanceState: (state) => {
			state.cohortExamPerformance = null;
			state.cohortExamPerformanceLoading = "idle";
			state.cohortExamPerformanceError = null;
		},
		clearDailyAttendancePercentageState: (state) => {
			state.dailyAttendancePercentage = null;
			state.dailyAttendancePercentageLoading = "idle";
			state.dailyAttendancePercentageError = null;
		},
		clearExamsListState: (state) => {
			state.examsList = [];
			state.examsListLoading = "idle";
			state.examsListError = null;
		},
		clearStudentExamResultsState: (state) => {
			state.studentExamResults = [];
			state.studentExamResultsLoading = "idle";
			state.studentExamResultsError = null;
			state.selectedExamId = null;
		},
		setSelectedExamId: (state, action) => {
			// New reducer to set selected exam ID
			state.selectedExamId = action.payload;
		},
		clearStudentFinanceDetailsState: (state) => {
			state.studentFinanceDetails = {
				accountBalance: 0,
				transactions: [],
			};
			state.studentFinanceDetailsLoading = "idle";
			state.studentFinanceDetailsError = null;
		},
		clearSchoolPaymentDetailsState: (state) => {
			state.schoolPaymentDetails = {};
			state.schoolPaymentDetailsLoading = "idle";
			state.schoolPaymentDetailsError = null;
		},
		clearUpdateSchoolPaymentDetailsState: (state) => {
			// New clear action for update status
			state.updateSchoolPaymentDetailsLoading = "idle";
			state.updateSchoolPaymentDetailsError = null;
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
				const updatedStudent = action.payload.updatedStudent;
				if (state.studentsData) {
					// Directly map over the flattened studentsData array
					state.studentsData = state.studentsData.map((student) =>
						student._id === updatedStudent._id
							? updatedStudent
							: student
					);
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
			})
			// createExam
			.addCase(createExam.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(createExam.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				state.exams.push(action.payload.exam); // Add new exam to list
			})
			.addCase(createExam.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			})

			// getExams
			.addCase(getExams.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(getExams.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				state.exams = action.payload.exams;
			})
			.addCase(getExams.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			})

			// getStudentsForResultsEntry
			.addCase(getStudentsForResultsEntry.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(getStudentsForResultsEntry.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				state.studentsForResultsEntry = action.payload.students;
			})
			.addCase(getStudentsForResultsEntry.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			})

			// updateStudentResult
			.addCase(updateStudentResult.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(updateStudentResult.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				// Optimistically update the student's result in studentsForResultsEntry
				const { studentId, subject } = action.meta.arg; // Get studentId and subject from original action payload
				const updatedResult = action.payload.result;

				const studentIndex = state.studentsForResultsEntry.findIndex(
					(s) => s._id === studentId
				);
				if (studentIndex !== -1) {
					const resultsIndex = state.studentsForResultsEntry[
						studentIndex
					].results.findIndex((r) => r.subject === subject);
					if (resultsIndex !== -1) {
						state.studentsForResultsEntry[studentIndex].results[
							resultsIndex
						] = updatedResult;
					} else {
						state.studentsForResultsEntry[
							studentIndex
						].results.push(updatedResult);
					}
				}
			})
			.addCase(updateStudentResult.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			})

			// setExamOfficial
			.addCase(setExamOfficial.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(setExamOfficial.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				// Update the status of the exam in the exams list
				const examIndex = state.exams.findIndex(
					(exam) => exam._id === action.payload.exam._id
				);
				if (examIndex !== -1) {
					state.exams[examIndex].status = "official";
					state.exams[examIndex].publishedAt =
						action.payload.exam.publishedAt;
					state.exams[examIndex].publishedBy =
						action.payload.exam.publishedBy;
				}
				state.selectedExam = action.payload.exam; // If a specific exam was selected
			})
			.addCase(setExamOfficial.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			})

			// getStudentExamResults
			.addCase(getStudentExamResults.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(getStudentExamResults.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				state.studentExamResults = action.payload;
			})
			.addCase(getStudentExamResults.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			})

			// getExamResultsByExamId
			.addCase(getExamResultsByExamId.pending, (state) => {
				state.examsLoading = "pending";
				state.examsError = null;
			})
			.addCase(getExamResultsByExamId.fulfilled, (state, action) => {
				state.examsLoading = "succeeded";
				state.selectedExam = action.payload.exam; // Store the exam details
				state.examOverviewResults = action.payload.results; // Store all results for that exam
			})
			.addCase(getExamResultsByExamId.rejected, (state, action) => {
				state.examsLoading = "failed";
				state.examsError = action.payload;
			});

		// getStudentsForAttendance
		builder.addCase(getStudentsForAttendance.pending, (state) => {
			state.attendanceLoading = "pending";
			state.attendanceError = null;
		});
		builder.addCase(getStudentsForAttendance.fulfilled, (state, action) => {
			state.attendanceLoading = "succeeded";
			state.studentsForAttendance = action.payload.students;
		});
		builder.addCase(getStudentsForAttendance.rejected, (state, action) => {
			state.attendanceLoading = "failed";
			state.attendanceError = action.payload;
		});

		// recordBatchAttendance
		builder.addCase(recordBatchAttendance.pending, (state) => {
			state.attendanceLoading = "pending";
			state.attendanceError = null;
		});
		builder.addCase(recordBatchAttendance.fulfilled, (state, action) => {
			state.attendanceLoading = "succeeded";
			// You might want to clear studentsForAttendance or update student summaries here
			// For now, we'll just show success and let the user refetch if they change date
			console.log(
				"Batch attendance recorded successfully:",
				action.payload.message
			);
		});
		builder.addCase(recordBatchAttendance.rejected, (state, action) => {
			state.attendanceLoading = "failed";
			state.attendanceError = action.payload;
		});

		// getMonthlyAttendanceSummary
		builder.addCase(getMonthlyAttendanceSummary.pending, (state) => {
			state.attendanceLoading = "pending";
			state.attendanceError = null;
		});
		builder.addCase(
			getMonthlyAttendanceSummary.fulfilled,
			(state, action) => {
				state.attendanceLoading = "succeeded";
				state.monthlyAttendanceSummary = action.payload.summary;
			}
		);
		builder.addCase(
			getMonthlyAttendanceSummary.rejected,
			(state, action) => {
				state.attendanceLoading = "failed";
				state.attendanceError = action.payload;
			}
		);

		// getStudentAttendanceSummary (no change needed here, as it just stores what API returns)
		builder.addCase(getStudentAttendanceSummary.pending, (state) => {
			state.attendanceLoading = "pending";
			state.attendanceError = null;
		});
		builder.addCase(
			getStudentAttendanceSummary.fulfilled,
			(state, action) => {
				state.attendanceLoading = "succeeded";
				state.studentAttendanceSummary = action.payload;
			}
		);
		builder.addCase(
			getStudentAttendanceSummary.rejected,
			(state, action) => {
				state.attendanceLoading = "failed";
				state.attendanceError = action.payload;
			}
		);
		// Reducers for getCohortExamPerformance
		builder.addCase(getCohortExamPerformance.pending, (state) => {
			state.cohortExamPerformanceLoading = "pending";
			state.cohortExamPerformanceError = null;
		});
		builder.addCase(getCohortExamPerformance.fulfilled, (state, action) => {
			state.cohortExamPerformanceLoading = "succeeded";
			state.cohortExamPerformance = action.payload;
		});
		builder.addCase(getCohortExamPerformance.rejected, (state, action) => {
			state.cohortExamPerformanceLoading = "failed";
			state.cohortExamPerformanceError = action.payload;
		});

		// Reducers for getDailyAttendancePercentage
		builder.addCase(getDailyAttendancePercentage.pending, (state) => {
			state.dailyAttendancePercentageLoading = "pending";
			state.dailyAttendancePercentageError = null;
		});
		builder.addCase(
			getDailyAttendancePercentage.fulfilled,
			(state, action) => {
				state.dailyAttendancePercentageLoading = "succeeded";
				state.dailyAttendancePercentage = action.payload;
			}
		);
		builder.addCase(
			getDailyAttendancePercentage.rejected,
			(state, action) => {
				state.dailyAttendancePercentageLoading = "failed";
				state.dailyAttendancePercentageError = action.payload;
			}
		);
		// Reducers for getExamsListForDropdown
		builder.addCase(getExamsListForDropdown.pending, (state) => {
			state.examsListLoading = "pending";
			state.examsListError = null;
		});
		builder.addCase(getExamsListForDropdown.fulfilled, (state, action) => {
			state.examsListLoading = "succeeded";
			state.examsList = action.payload;
			// Optionally, set the most recent exam as default if available
			if (action.payload.length > 0 && state.selectedExamId === null) {
				state.selectedExamId = action.payload[0]._id;
			}
		});
		builder.addCase(getExamsListForDropdown.rejected, (state, action) => {
			state.examsListLoading = "failed";
			state.examsListError = action.payload;
		});

		// Reducers for getStudentExamResultsForExam
		builder.addCase(getStudentExamResultsForExam.pending, (state) => {
			state.studentExamResultsLoading = "pending";
			state.studentExamResultsError = null;
		});
		builder.addCase(
			getStudentExamResultsForExam.fulfilled,
			(state, action) => {
				state.studentExamResultsLoading = "succeeded";
				state.studentExamResults = action.payload;
			}
		);
		builder.addCase(
			getStudentExamResultsForExam.rejected,
			(state, action) => {
				state.studentExamResultsLoading = "failed";
				state.studentExamResultsError = action.payload;
			}
		);
		// Reducers for getStudentFinanceDetails
		builder.addCase(getStudentFinanceDetails.pending, (state) => {
			state.studentFinanceDetailsLoading = "pending";
			state.studentFinanceDetailsError = null;
		});
		builder.addCase(getStudentFinanceDetails.fulfilled, (state, action) => {
			state.studentFinanceDetailsLoading = "succeeded";
			state.studentFinanceDetails = action.payload;
		});
		builder.addCase(getStudentFinanceDetails.rejected, (state, action) => {
			state.studentFinanceDetailsLoading = "failed";
			state.studentFinanceDetailsError = action.payload;
		});

		// Reducers for getSchoolPaymentDetails
		builder.addCase(getSchoolPaymentDetails.pending, (state) => {
			state.schoolPaymentDetailsLoading = "pending";
			state.schoolPaymentDetailsError = null;
		});
		builder.addCase(getSchoolPaymentDetails.fulfilled, (state, action) => {
			state.schoolPaymentDetailsLoading = "succeeded";
			state.schoolPaymentDetails = action.payload;
		});
		builder.addCase(getSchoolPaymentDetails.rejected, (state, action) => {
			state.schoolPaymentDetailsLoading = "failed";
			state.schoolPaymentDetailsError = action.payload;
		});
		// Reducers for updateSchoolPaymentDetails
        builder.addCase(updateSchoolPaymentDetails.pending, (state) => {
            state.updateSchoolPaymentDetailsLoading = 'pending';
            state.updateSchoolPaymentDetailsError = null;
        });
        builder.addCase(updateSchoolPaymentDetails.fulfilled, (state, action) => {
            state.updateSchoolPaymentDetailsLoading = 'succeeded';
            // Optionally update the schoolPaymentDetails state directly after a successful update
            // This ensures the displayed data is fresh without another GET call
            state.schoolPaymentDetails = action.payload.paymentDetails;
            state.updateSchoolPaymentDetailsError = null; // Clear any previous errors
        });
        builder.addCase(updateSchoolPaymentDetails.rejected, (state, action) => {
            state.updateSchoolPaymentDetailsLoading = 'failed';
            state.updateSchoolPaymentDetailsError = action.payload;
        });
	},
});

export const {
	setSelectedStudent,
	setSelectedTeacher,
	clearExamState,
	clearSelectedExamData,
	clearAttendanceState,
	clearStudentAttendanceSummary,
	clearCohortExamPerformanceState,
	clearDailyAttendancePercentageState,
	clearExamsListState,
	clearStudentExamResultsState,
	setSelectedExamId,
	clearStudentFinanceDetailsState,
	clearSchoolPaymentDetailsState,
    clearUpdateSchoolPaymentDetailsState, 
} = schoolSlice.actions;
export default schoolSlice.reducer;
