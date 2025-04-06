import { element, exact } from "prop-types";
import React from "react";

const Dashboard = React.lazy(() => import("./components/Dashboard/Dashboard"));
const Streams = React.lazy(() => import("./views/students/Streams"));
const Classes = React.lazy(() => import("./views/students/Classes"));
const StudentProfile = React.lazy(() => import("./views/students/StudentProfile"));

const routes = [
	{ path: "/", exact: true, name: "Home" },
	{ path: "/dashboard", exact:true, name: "Dashboard", element: Dashboard },
	{ path: "/students", exact:true, name: "Students", element: Streams },
	{ path: "/students/streams", name: "Streams", element: Streams },
	{ path: "/students/classes", name: "Classes", element: Classes },
	{ path: "/students/profile", name: "Student Profile", element: StudentProfile },
];


export default routes