import React, { useEffect, useState } from "react";

import CIcon from "@coreui/icons-react";
import { CCol, CRow, CSpinner, CWidgetStatsC } from "@coreui/react";

import { useDispatch, useSelector } from "react-redux";
import {
	getStudentAttendanceSummary,
	clearAttendanceState,
	clearExamsListState,
	getExamsListForDropdown,
	clearStudentExamResultsState,
	getStudentExamResultsForExam,
} from "../../store/schoolSlice"; // Adjust path
import StudentExamResultsTable from "../../views/students/StudentExamResultsTable";
import StudentFinance from "../../views/students/StudentFinance";

const Dashboard = () => {
	const dispatch = useDispatch();
	const myStudentId = useSelector((state) => state.auth.myStudentId);
	const { studentAttendanceSummary } = useSelector((state) => state.school);
	const studentAttendancePercentage =
		100 *
		((studentAttendanceSummary?.summary?.totalDaysPresent +
			studentAttendanceSummary?.summary?.totalDaysExcused) /
			(studentAttendanceSummary?.summary?.totalDaysPresent +
				studentAttendanceSummary?.summary?.totalDaysLate +
				studentAttendanceSummary?.summary?.totalDaysExcused +
				studentAttendanceSummary?.summary?.totalDaysAbsent));

	useEffect(() => {
		dispatch(getStudentAttendanceSummary(myStudentId));
		return () => {
			dispatch(clearAttendanceState()); // Clean up state on unmount
		};
	}, [dispatch]);

	const {
		examsList,
		examsListLoading,
		examsListError,
		studentExamResults,
		studentExamResultsLoading,
		studentExamResultsError,
	} = useSelector((state) => state.school);

	const [mostRecentExam, setMostRecentExam] = useState(null);

	useEffect(() => {
		dispatch(getExamsListForDropdown());

		return () => {
			dispatch(clearExamsListState());
			dispatch(clearStudentExamResultsState());
		};
	}, [dispatch]);

	useEffect(() => {
		if (examsList && examsList.length > 0) {
			// Sort exams by date descending
			const sortedExams = [...examsList].sort(
				(a, b) => new Date(b.examDate) - new Date(a.examDate)
			);
			const latest = sortedExams[0];
			setMostRecentExam(latest);

			if (latest && myStudentId) {
				const resp = dispatch(
					getStudentExamResultsForExam({
						studentId: myStudentId,
						examId: latest._id,
					})
				);
			}
		}
	}, [examsList, myStudentId, dispatch]);

	// Calculate average marks if results exist
	let averageMarks = null;
	if (
		studentExamResults &&
		studentExamResults.length > 0 &&
		studentExamResultsLoading === "succeeded"
	) {
		const total = studentExamResults.reduce(
			(sum, result) => sum + (result.marks || 0),
			0
		);
		averageMarks = total / studentExamResults.length;
	}

	return (
		<>
			<CRow className="justify-content-center">
				<CCol>
					<CWidgetStatsC
						className="mb-3 shadow border-0"
						icon={
							<i className="fa-duotone fa-solid fa-user-graduate nav-icon fs-1 text-primary"></i>
						}
						color="body"
						progress={{
							color: "primary",
							value: studentAttendancePercentage
								? studentAttendancePercentage.toFixed(2)
								: 0,
						}}
						title="Attendance Average"
						value={`${
							studentAttendancePercentage
								? studentAttendancePercentage.toFixed(0)
								: 0
						} %`}
					/>
				</CCol>
				<CCol>
					{examsListLoading === "pending" ||
					studentExamResultsLoading === "pending" ? (
						<CSpinner color="primary" />
					) : examsListError || studentExamResultsError ? null : (
						<CWidgetStatsC
							className="mb-3 shadow border-0"
							icon={
								<i className="fa-solid fa-chart-line nav-icon fs-1 text-success"></i>
							}
							color="body"
							progress={{
								color: "success",
								value: averageMarks
									? averageMarks.toFixed(0)
									: 0,
							}}
							title={`Exam Average: ${
								mostRecentExam?.examName || "N/A"
							}`}
							value={`${
								averageMarks !== null
									? averageMarks.toFixed(0)
									: "N/A"
							} %`}
						/>
					)}
				</CCol>
			</CRow>
			<CRow>
				<CCol>
					{myStudentId ? (
						<StudentExamResultsTable studentId={myStudentId} />
					) : (
						<CCol xs={12}>
							<CAlert color="info">
								Loading student information or student ID not
								found.
							</CAlert>
						</CCol>
					)}
				</CCol>
			</CRow>
			<CRow>
				<CCol>
					{myStudentId ? (
						<StudentFinance studentId={myStudentId} />
					) : (
						<CCol xs={12}>
							<CAlert color="info">
								Loading student information or student ID not
								found.
							</CAlert>
						</CCol>
					)}
				</CCol>
			</CRow>
		</>
	);
};

export default Dashboard;
