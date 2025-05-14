// src/components/Auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CSpinner } from "@coreui/react";

const ProtectedRoute = ({ children, allowedRoles }) => {
	const { role, token, isReady } = useSelector((state) => state.auth);

	// Wait for auth state to be ready before doing anything
	if (!isReady) {
		return (
			<div className="pt-3 text-center">
				<CSpinner color="primary" />
			</div>
		);
	}

	// If no token or role, redirect to login
	if (!token || !role) {
		return <Navigate to="/login" replace />;
	}

	// If role is not in allowed list, redirect to unauthorized page
	if (allowedRoles && !allowedRoles.includes(role)) {
		return <Navigate to="/unauthorized" replace />;
	}

	// Otherwise, allow access
	return children;
};

export default ProtectedRoute;
