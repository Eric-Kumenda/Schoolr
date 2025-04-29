import React from "react";

import ProtectedRoute from "../components/ProtectedRoute";
import { element, exact } from "prop-types";

const AdminDashboard = React.lazy(() =>
	import("../components/Dashboard/AdminDashboard")
);
const PendingRequests = React.lazy(() =>
	import("../views/pages/SchoolMembership/PendingRequests")
);
const CreateSchool = React.lazy(() =>
	import("../views/pages/SchoolMembership/CreateSchool")
);
const TeacherDashboard = React.lazy(() =>
	import("../components/Dashboard/TeacherDashboard")
);
const ParentDashboard = React.lazy(() =>
	import("../components/Dashboard/ParentDashboard")
);
const StudentDashboard = React.lazy(() =>
	import("../components/Dashboard/StudentDashboard")
);
const Streams = React.lazy(() => import("../views/students/Streams"));
const Classes = React.lazy(() => import("../views/students/Classes"));
const StudentProfile = React.lazy(() =>
	import("../views/students/StudentProfile")
);
const Chat = React.lazy(() => import("../views/pages/Chat/Chat"));
const NotFound = React.lazy(() => import("../views/pages/page404/Page404"));

const adminRoutes = [
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
		path: "/school/create",
		exact: true,
		name: "Create School",
		element: CreateSchool,
	},
	{
		path: "/school/pending-requests",
		exact: true,
		name: "Pending School Requests",
		element: PendingRequests,
	},
	{
		path: "/school",
		exact: true,
		name: "School Profile",
		element: Streams,
		
	},
	{
		path: "/school/profile",
		exact: true,
		name: "Students",
		element: Streams,
		
	},
	{
		path: "/students",
		exact: true,
		name: "Students",
		element: Streams,
		
	},
	{
		path: "/students/streams",
		exact: true,
		name: "Streams",
		element: Streams,
		
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

export default adminRoutes;
