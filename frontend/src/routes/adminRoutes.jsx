import React from "react";

import ProtectedRoute from "../components/ProtectedRoute";
import { element, exact } from "prop-types";
const LinkUserToSchool = React.lazy(() =>
	import("../views/pages/SchoolMembership/LinkUserToSchool"))

const AdminDashboard = React.lazy(() =>
	import("../components/Dashboard/AdminDashboard")
);
const PendingRequests = React.lazy(() =>
	import("../views/pages/SchoolMembership/PendingRequests")
);
const CreateSchool = React.lazy(() =>
	import("../views/pages/SchoolMembership/CreateSchool")
);
const UploadStudents = React.lazy(() =>
	import("../views/pages/SchoolMembership/UploadStudents")
);
const UploadTeachers = React.lazy(() =>
	import("../views/pages/SchoolMembership/UploadTeachers")
);
const CreateExam = React.lazy(() =>
	import( "../views/exams/CreateExam")
);
const ManageExams = React.lazy(() =>
	import("../views/exams/ManageExams")
);
const ExamOverview = React.lazy(() =>
	import("../views/exams/ExamOverview")
);
const ResultsEntry = React.lazy(() =>
	import("../views/exams/ResultsEntry")
);
const ViewStudentResults = React.lazy(() =>
	import("../views/exams/ViewStudentResults")
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
		path: "/school/profile",
		exact: true,
		name: "Students",
		element: StudentList,
	},
	{
		path: "/students",
		exact: true,
		name: "Students",
		element: StudentList,
	},
	{
		path: "/students/upload",
		exact: true,
		name: "Students Upload",
		element: UploadStudents,
	},
	{
		path: "/teachers/upload",
		exact: true,
		name: "Teachers Upload",
		element: UploadTeachers,
	},
	{
		path: "/teachers/list",
		exact: true,
		name: "Teachers List",
		element: TeachersList,
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
		path: "/teachers/profile",
		exact: true,
		name: "Teacher Profile",
		element: TeacherProfile,
	},
	{
		path: "/exams/create",
		exact: true,
		name: "Create Exam",
		element: CreateExam,
	},
	{
		path: "/exams",
		exact: true,
		name: "Manage Exam",
		element: ManageExams,
	},
	{
		path: "/results/entry/:examId",
		exact: true,
		name: "Results Entry",
		element: ResultsEntry,
	},
	{
		path: "/results/overview/:examId",
		exact: true,
		name: "Results Overview",
		element: ExamOverview,
	},
	{
		path: "/students/:studentId/results",
		exact: true,
		name: "View Students Results",
		element: ViewStudentResults,
	},
	{
		path: "/link-user",
		exact: true,
		name: "Link User Account",
		element: LinkUserToSchool,
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
