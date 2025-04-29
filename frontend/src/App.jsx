import React, { useEffect, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { CSpinner, useColorModes } from "@coreui/react";

// Import all of Bootstrap's JS
import "@coreui/coreui/dist/css/coreui.min.css";
//import "bootstrap/dist/css/bootstrap.min.css";
//import "@coreui/coreui/dist/js/bootstrap.bundle.min.js";
import "@coreui/coreui/dist/js/coreui.bundle.min.js";

import "core-js";

// Import our custom CSS
import "./scss/styles.scss";
import "./scss/custom.scss";
import ProtectedRoute from "./components/ProtectedRoute";
import { loadUser } from "./store/authSlice";
//import "./scss/customBootstrap.scss";

// Containers
const AdminLayout = React.lazy(() => import("./layout/AdminLayout"));
const TeacherLayout = React.lazy(() => import("./layout/TeacherLayout"));
const ParentLayout = React.lazy(() => import("./layout/ParentLayout"));
const StudentLayout = React.lazy(() => import("./layout/StudentLayout"));

// Pages
const Login = React.lazy(() => import("./views/pages/Login/Login"));
const RegisterStaff = React.lazy(() =>
	import("./views/pages/Register/NewStaffReg")
);
const RegisterStudent = React.lazy(() =>
	import("./views/pages/Register/NewStudent")
);
const Page404 = React.lazy(() => import("./views/pages/page404/Page404"));
const Page500 = React.lazy(() => import("./views/pages/page500/Page500"));

const App = () => {
	const dispatch = useDispatch();
	const { isColorModeSet, setColorMode } = useColorModes("Schoolr");
	const storedTheme = useSelector((state) => state.app.theme);

	useEffect(() => {
		const urlParams = new URLSearchParams(
			window.location.href.split("?")[1]
		);
		const theme =
			urlParams.get("theme") &&
			urlParams.get("theme").match(/^[A-Za-z0-9\s]+/)[0];
		if (theme) {
			setColorMode(theme);
		}

		if (isColorModeSet()) {
			return;
		}

		setColorMode(storedTheme);
	}, []);

	useEffect(() => {
		dispatch(loadUser());
	}, []);

	return (
		<HashRouter>
			<Suspense
				fallback={
					<div className="pt-3 text-center">
						<CSpinner color="body" />
					</div>
				}>
				<Routes>
						<Route path="/login" element={<Login />} />
						<>
							<Route path="/500" element={<Page500 />} />
							<Route path="/404" element={<Page404 />} />

							<Route
								path="/admin/*"
								element={
									<ProtectedRoute allowedRoles={["admin"]}>
										<AdminLayout />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/teacher/*"
								element={
									<ProtectedRoute allowedRoles={["teacher"]}>
										<TeacherLayout />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/student/*"
								element={
									<ProtectedRoute allowedRoles={["student"]}>
										<StudentLayout />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/parent/*"
								element={
									<ProtectedRoute allowedRoles={["parent"]}>
										<ParentLayout />
									</ProtectedRoute>
								}
							/>

							<Route path="*" element={<Page404 />} />
						</>
				</Routes>
			</Suspense>
		</HashRouter>
	);
};

export default App;
