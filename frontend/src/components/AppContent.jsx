import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { CContainer, CSpinner } from "@coreui/react";

const AppContent = ({ routes }) => {
	return (
		<CContainer className="px-4" lg>
			<Suspense fallback={<CSpinner color="primary" />}>
				<Routes>
					{routes.map((route, idx) => {
						const Element = route.element;
						return (
							<Route
								key={idx}
								path={route.path}
								exact={route.exact}
								element={
									route.allowedRoles ? (
										<ProtectedRoute
											allowedRoles={route.allowedRoles}>
											<Element />
										</ProtectedRoute>
									) : (
										<Element />
									)
								}
							/>
						);
					})}
				</Routes>
			</Suspense>
		</CContainer>
	);
};

export default React.memo(AppContent);
