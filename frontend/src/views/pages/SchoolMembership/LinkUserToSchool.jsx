import React, { useState, useEffect } from "react";
import {
	CButton,
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CForm,
	CFormInput,
	CFormSelect,
	CFormCheck,
	CRow,
	CAlert,
	CSpinner,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	linkUserToSchool,
	clearUserLinkingState,
} from "../../../store/authSlice"; // Adjust path
import { addToast } from "../../../store/toastSlice";

const LinkUserToSchool = () => {
	const dispatch = useDispatch();
	const { userLinkingLoading, userLinkingError } = useSelector(
		(state) => state.school
	);

	const [email, setEmail] = useState("");
	const [role, setRole] = useState("");
	const [isVerified, setIsVerified] = useState(false);

	useEffect(() => {
		return () => {
			dispatch(clearUserLinkingState()); // Clean up state on unmount
		};
	}, [dispatch]);

	const handleLinkUser = async () => {
		if (!email || !role) {
			alert("Please fill in Email and select a Role.");
			return;
		}

		const resultAction = await dispatch(
			linkUserToSchool({ email, role, isVerified })
		);

		if (linkUserToSchool.fulfilled.match(resultAction)) {
			dispatch(
				addToast({
					id: Date.now(),
					message: resultAction.payload.message,
					title: "Success",
					color: "#28a745",
					timestamp: Date.now(),
				})
			);
			// Clear form on success
			setEmail("");
			setRole("");
			setIsVerified(false);
		}
		// Error handling is managed by userLinkingError in Redux state
	};

	return (
		<CRow className="justify-content-center">
			<CCol md={10} lg={8}>
				<CCard className="shadow-sm">
					<CCardHeader>
						<strong>Link User to School (Admin)</strong>
					</CCardHeader>
					<CCardBody>
						{userLinkingError &&
							dispatch(
								addToast({
									id: Date.now(),
									message:
										"User linking failed. Please try again.",
									title: "Success",
									color: "#28a745",
									timestamp: Date.now(),
								})
							)}

						<CForm>
							<CRow className="mb-3">
								<CCol xs={12}>
									<CFormInput
										type="email"
										label="User Email"
										placeholder="user@example.com"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										required
									/>
								</CCol>
							</CRow>

							<CRow className="mb-3">
								<CCol xs={12}>
									<CFormSelect
										label="Select Role"
										options={[
											{
												label: "Select Role",
												value: "",
												disabled: true,
											},
											{
												label: "Teacher",
												value: "teacher",
											},
											{
												label: "Finance Clerk",
												value: "finance",
											},
											{
												label: "Student",
												value: "student",
											},
											{
												label: "Parent",
												value: "parent",
											},
											{
												label: "Admin",
												value: "admin",
											},
										]}
										value={role}
										onChange={(e) =>
											setRole(e.target.value)
										}
										required
									/>
								</CCol>
							</CRow>

							<CRow className="mb-3">
								<CCol xs={12}>
									<CFormCheck
										id="isVerifiedCheckbox"
										label="Verify User (Allow access)"
										checked={isVerified}
										onChange={(e) =>
											setIsVerified(e.target.checked)
										}
									/>
								</CCol>
							</CRow>

							<CButton
								color="primary"
								onClick={handleLinkUser}
								disabled={userLinkingLoading === "pending"}
								className="mt-3">
								{userLinkingLoading === "pending"
									? "Linking..."
									: "Link User"}
							</CButton>
						</CForm>
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
	);
};

export default LinkUserToSchool;
