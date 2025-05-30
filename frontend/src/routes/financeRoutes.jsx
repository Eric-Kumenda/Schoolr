import React from "react";

import ProtectedRoute from "../components/ProtectedRoute";
import { element, exact } from "prop-types";

const AdminDashboard = React.lazy(() =>
	import("../components/Dashboard/AdminDashboard")
);
const RecordPayment = React.lazy(() =>
	import("../views/finance/RecordPayment")
);
const ParentDashboard = React.lazy(() =>
	import("../components/Dashboard/ParentDashboard")
);
const StudentDashboard = React.lazy(() =>
	import("../components/Dashboard/StudentDashboard")
);
const StudentList = React.lazy(() => import("../views/students/StudentList"));
const TeachersList = React.lazy(() => import("../views/teachers/TeachersList"));
const Classes = React.lazy(() => import("../views/students/Classes"));
const StudentProfile = React.lazy(() =>
	import("../views/students/StudentProfile")
);
const TeacherProfile = React.lazy(() =>
	import("../views/teachers/TeacherProfile")
);
const Chat = React.lazy(() => import("../views/pages/Chat/Chat"));
const NotFound = React.lazy(() => import("../views/pages/page404/Page404"));

const financeRoutes = [
	{
		path: "/",
		name: "Admin Dashboard",
		element: AdminDashboard,
		exact: true,
	},
	{
		path: "/dashboard",
		name: "Admin Dashboard",
		element: AdminDashboard,
		exact: true,
	},
	{
		path: "/record",
		exact: true,
		name: "Record Payments",
		element: RecordPayment,
	},

	{
		path: "/students/list",
		exact: true,
		name: "Students List",
		element: StudentList,
	},
	{
		path: "/students/classes",
		exact: true,
		name: "Classes",
		element: Classes,
	},
	{
		path: "/students/profile",
		exact: true,
		name: "Student Profile",
		element: StudentProfile,
	},

	{
		path: "/chat",
		exact: true,
		name: "Messages",
		element: Chat,
	},
	{
		path: "/*",
		element: NotFound,
		name: "Page Not Found",
	},
];

export default financeRoutes;
