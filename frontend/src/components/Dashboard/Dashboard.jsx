import React from "react";

import CIcon from "@coreui/icons-react";
import { cilChartPie } from "@coreui/icons";
import { CCol, CRow, CWidgetStatsC } from "@coreui/react";

import { useSelector, useDispatch } from "react-redux";

const Dashboard = () => {
	return (
		<>
			<CRow>
				<CCol xs={4}>
					<CWidgetStatsC
						className="mb-3"
						icon={<i className="fa-duotone fa-solid fa-user-graduate nav-icon fs-1 text-primary"></i>}
						progress={{ color: "primary", value: 100 }}
						title="Total Students"
						value="2,166"
					/>
				</CCol>
				<CCol xs={4}>
					<CWidgetStatsC
						className="mb-3"
						icon={<i className="fa-solid fa-clipboard-list-check nav-icon fs-1"></i>}
						color="primary"
						inverse
						progress={{ value: 75 }}
						title="Student Attendance"
						value="89.9%"
					/>
				</CCol>
				<CCol xs={4}>
					<CWidgetStatsC
						className="mb-3"
						icon={<i className="fa-duotone fa-solid fa-user-tie nav-icon fs-1"></i>}
						color=""
						
						progress={{ color: "info", value: 100 }}
						title="Total Staff"
						value="131"
					/>
				</CCol>
			</CRow>
		</>
	);
};

export default Dashboard;
