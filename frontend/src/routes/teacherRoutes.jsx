import React from "react";

const PendingRequests = React.lazy(() =>
	import("../views/pages/SchoolMembership/PendingRequests")
);
const TeacherDashboard = React.lazy(() =>
	import("../components/Dashboard/TeacherDashboard")
);
const JoinSchool = React.lazy(() =>
	import("../views/pages/SchoolMembership/JoinSchool")
);
const Streams = React.lazy(() => import("../views/students/Streams"));
const Classes = React.lazy(() => import("../views/students/Classes"));
const StudentProfile = React.lazy(() =>
	import("../views/students/StudentProfile")
);
const StudentList = React.lazy(() => import("../views/students/StudentList"));
const TakeAttendance = React.lazy(() =>
	import("../views/attendance/TakeAttendance")
);
const Chat = React.lazy(() => import("../views/pages/Chat/Chat"));
const NotFound = React.lazy(() => import("../views/pages/page404/Page404"));

const teacherRoutes = [
	{
		path: "/",
		name: "Teacher Dashboard",
		element: TeacherDashboard,
		exact: true,
	},
	{
		path: "/dashboard",
		name: "Teacher Dashboard",
		element: TeacherDashboard,
		exact: true,
	},

	{
		path: "/join",
		exact: true,
		name: "School Profile",
		element: JoinSchool,
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
		path: "/attendance/take",
		exact: true,
		name: "Take Attendance",
		element: TakeAttendance,
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

export default teacherRoutes;
