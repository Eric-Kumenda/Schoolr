import React from "react";


const StudentDashboard = React.lazy(() =>
	import("../components/Dashboard/StudentDashboard")
);
const JoinSchool = React.lazy(() =>
	import("../views/pages/SchoolMembership/JoinSchool")
);
const Streams = React.lazy(() => import("../views/students/Streams"));
const Classes = React.lazy(() => import("../views/students/Classes"));
const StudentProfile = React.lazy(() =>
	import("../views/students/StudentProfile")
);
const Chat = React.lazy(() => import("../views/pages/Chat/Chat"));
const NotFound = React.lazy(() => import("../views/pages/page404/Page404"));

const studentRoutes = [
	{
		path: "/",
		name: "Student Dashboard",
		element: StudentDashboard,
		exact: true,
	},
	{
		path: "/dashboard",
		name: "Student Dashboard",
		element: StudentDashboard,
		exact: true,
	},
	{
		path: "/join",
		exact: true,
		name: "School Profile",
		element: JoinSchool,
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

export default studentRoutes;
