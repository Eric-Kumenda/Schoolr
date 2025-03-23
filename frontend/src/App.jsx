import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Components/Login/Login";
import NewStudentReg from "./Components/Register/NewStudent";
import NewStaffReg from "./Components/Register/NewStaffReg";
import Dashboard from "./Components/Dashboard/Dashboard";
import AppSidebar from "./Components/AppSidebar";

const App = () => {
	return (
		<Router>
			<Routes>
				{/* Root Path */}
				<Route path="/" element={<h2>Schoolr</h2>} />
				{/* Dashboard Path */}
				<Route path="/dashboard" element={<AppSidebar />} />

				{/* Auth route */}
				<Route path="/auth">
					<Route index element={<p>Auth</p>} />
					{/* Login Route */}
					<Route path="login" element={<Login />} />
					{/* New Student Registration Route */}
					<Route path="newStudent" element={<NewStudentReg />} />
					{/* New Staff Registration Route */}
					<Route path="newStaff" element={<NewStaffReg />} />
				</Route>
			</Routes>
		</Router>
	);
};

export default App;
