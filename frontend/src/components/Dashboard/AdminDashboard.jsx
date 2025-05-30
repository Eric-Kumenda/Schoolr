import React, { useEffect } from "react";

import CIcon from "@coreui/icons-react";
import { cilChartPie } from "@coreui/icons";
import { CCol, CRow, CWidgetStatsC } from "@coreui/react";

import { useSelector, useDispatch } from "react-redux";
import { fetchSchoolMetrics } from "../../store/schoolSlice";
import CohortExamPerformanceChart from "../../views/exams/CohortExamPerformanceChart";
import DailyAttendanceChart from "../../views/attendance/DailyAttendanceChart";

const Dashboard = () => {
	const dispatch = useDispatch();
	const schoolId = useSelector((state) => state.auth.schoolId);
	const { totalStudents, totalTeachers } = useSelector(
		(state) => state.school.schoolMetrics
	);

	useEffect(() => {
		dispatch(fetchSchoolMetrics(schoolId));
	}, [schoolId, dispatch]);

	return (
		<>
			<CRow>
				<CCol xs={12} md={4}>
					<CWidgetStatsC
						className="mb-3 shadow border-0"
						icon={
							<i className="fa-duotone fa-solid fa-user-graduate nav-icon fs-1 text-primary"></i>
						}
						color="body"
						progress={{ color: "primary", value: 100 }}
						title="Total Students"
						value={totalStudents ? totalStudents : "0"}
					/>
				</CCol>
				<CCol xs={12} md={4}>
					<CWidgetStatsC
						className="mb-3 shadow border-0"
						icon={
							<i className="fa-solid fa-clipboard-list-check nav-icon fs-1 text-info"></i>
						}
						color="body"
						progress={{ color: "info", value: 75 }}
						title="Student Attendance"
						value="89.9%"
					/>
				</CCol>
				<CCol xs={12} md={4}>
					<CWidgetStatsC
						className="mb-3 shadow border-0"
						icon={
							<i className="fa-solid fa-user-tie nav-icon fs-1 text-warning"></i>
						}
						color="body"
						progress={{ color: "warning", value: 100 }}
						title="Total Staff"
						value={totalTeachers ? totalTeachers : "0"}
					/>
				</CCol>
			</CRow>

			<CohortExamPerformanceChart />
			<DailyAttendanceChart />
		</>
	);
};

export default Dashboard;
