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
const FinanceDashboard = React.lazy(() =>
	import("../views/finance/FinanceDashboard")
);
const Streams = React.lazy(() => import("../views/students/Streams"));
const Classes = React.lazy(() => import("../views/students/Classes"));
const StudentProfile = React.lazy(() =>
	import("../views/students/StudentProfile")
);
const Chat = React.lazy(() => import("../views/pages/Chat/Chat"));
const NotFound = React.lazy(() => import("../views/pages/page404/Page404"));

const parentRoutes = [
	{
		path: "/",
		name: "Parent Dashboard",
		element: ParentDashboard,
		exact: true,
	},
	{
		path: "/dashboard",
		name: "Parent Dashboard",
		element: ParentDashboard,
		exact: true,
	},
	{
		path: "/finance",
		exact: true,
		name: "Finance",
		element: FinanceDashboard,
		
	},
	{
		path: "/students",
		exact: true,
		name: "Students",
		element: Streams,
		
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

export default parentRoutes;
