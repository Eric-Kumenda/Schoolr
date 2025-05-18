import { CAvatar, CButton, CForm, CFormInput, CSpinner } from "@coreui/react";
import React, { useEffect, useState } from "react";
import avatar4 from "./../../assets/images/avatars/4.jpg";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateSchoolStudent } from "../../store/schoolSlice";
import { addToast } from "../../store/toastSlice";

const StudentProfile = ({ isModal }) => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const selectedStudent = useSelector(
		(state) => state.school.selectedStudent
	);
	const [studentData, setStudentData] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	useEffect(() => {
		// Initialize local state when selectedStudent changes
		if (selectedStudent) {
			setStudentData({ ...selectedStudent });
		}
	}, [selectedStudent]);

	const handleInputChange = (event) => {
		const { id, value } = event.target;
		setStudentData({ ...studentData, [id]: value });
	};

	const handleEditClick = () => {
		setIsEditing(true);
	};

	const handleSaveClick = async () => {
		if (studentData && studentData._id && studentData !== selectedStudent) {
			const res = await dispatch(updateSchoolStudent(studentData)); // Dispatch the update Thunk
			// Optionally, show a success message or refetch data
			if (res?.payload?.message) {
				dispatch(
					addToast({
						id: Date.now(),
						message: res.payload.message,
						title: "Success",
						color: "#28a745",
						timestamp: Date.now(),
					})
				);
				setIsEditing(false);
			} else if (res?.error) {
				dispatch(
					addToast({
						id: Date.now(),
						message: res.payload,
						title: "Error",
						color: "#e55353",
						timestamp: Date.now(),
					})
				);
			}
		}
	};

	const handleDiscardClick = () => {
		setStudentData({ ...selectedStudent }); // Reset to original data
		setIsEditing(false);
		dispatch(
			addToast({
				id: Date.now(),
				message: "Changes Discarded Successfully",
				title: "Success",
				color: "#28a745",
				timestamp: Date.now(),
			})
		);
	};
	const redirect = () =>
		setTimeout(() => navigate("/admin/students/list"), 2000);

	if (studentData) {
		return (
			<div className="container-fluid">
				{isEditing && !isModal && (
					<div className="row mb-3 position-fixed fixed-bottom bg-body w-100">
						<div className="col d-flex justify-content-end me-md-5">
							<CButton
								color="primary"
								className="me-2"
								onClick={handleSaveClick}>
								Save Changes
							</CButton>
							<CButton
								color="secondary"
								onClick={handleDiscardClick}>
								Discard Changes
							</CButton>
						</div>
					</div>
				)}
				<div className="row mb-4 border shadow rounded ps-5 py-3">
					<div className="col col-auto d-flex justify-content-center">
						<CAvatar
							src={avatar4}
							size="md"
							className="w-100 h-100"
						/>
					</div>
					<div className="col ps-3">
						<p className="fw-bold fs-4 mb-1">{`${
							studentData.first_name
						} ${studentData.middle_name || ""} ${
							studentData.surname
						}`}</p>
						<p className="mb-1">
							Adm No:{" "}
							<span className="fw-bold">
								{studentData.adm_no}
							</span>
						</p>
						<p>
							Form {studentData.current_study_year}{" "}
							{studentData.stream}
						</p>
					</div>
				</div>
				{/* ... other student details ... */}
				<div className="row mb-4 border shadow rounded py-3">
					<div className="col">
						<div className="row mb-3">
							{!isEditing || isModal ? (
								<div className="col col-12 d-flex align-items-start justify-content-end">
									<button
										className="btn rounded btn-outline-secondary w-auto"
										onClick={
											isModal
												? () =>
														navigate(
															"/admin/students/profile"
														)
												: handleEditClick
										}>
										<i className="fa-regular fa-pen"></i>
									</button>
								</div>
							) : (
								""
							)}
							<div className="col-12">
								<span className="fw-bold fs-4">
									Student Information
								</span>
							</div>
						</div>
						<div className="row g-3">
							<div className="col col-12">
								<CFormInput
									type="text"
									id="surname"
									label="Surname"
									placeholder="Surname"
									value={studentData.surname || ""}
									disabled={isModal || !isEditing}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col col-12 col-md-6">
								<CFormInput
									type="text"
									id="first_name"
									label="First Name"
									placeholder="First Name"
									value={studentData.first_name || ""}
									disabled={isModal || !isEditing}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col col-12 col-md-6">
								<CFormInput
									type="text"
									id="middle_name"
									label="Middle Name"
									placeholder="Middle Name"
									value={studentData.middle_name || ""}
									disabled={isModal || !isEditing}
									onChange={handleInputChange}
								/>
							</div>
							{/* Add more fields here */}
							<div className="col col-12 col-md-6">
								<CFormInput
									type="text"
									id="birth_cert_no"
									label="Birth Certificate No"
									placeholder="Birth Certificate No"
									value={studentData.birth_cert_no || ""}
									disabled={isModal || !isEditing}
									onChange={handleInputChange}
								/>
							</div>
							<div className="col col-12 col-md-6">
								<CFormInput
									type="date"
									id="DOB"
									label="Date of Birth"
									value={
										studentData.DOB
											? studentData.DOB.substring(0, 10)
											: ""
									}
									disabled={isModal || !isEditing}
									onChange={handleInputChange}
								/>
							</div>
							{/* ... add all other relevant student fields with similar CFormInput components */}
						</div>
					</div>
				</div>
				{/* Parent/Guardian Information sections - you'll implement these similarly */}
				<div className="row mb-4 border shadow rounded py-3">
					<div className="col">
						<div className="row mb-3">
							{!isEditing || isModal ? (
								<div className="col col-12 d-flex align-items-start justify-content-end">
									<button
										className="btn rounded btn-outline-secondary w-auto"
										onClick={
											isModal
												? () =>
														navigate(
															"/admin/students/profile"
														)
												: handleEditClick
										}>
										<i className="fa-regular fa-pen"></i>
									</button>
								</div>
							) : (
								""
							)}
							<div className="col-12">
								<span className="fw-bold fs-4">
									Parent / Guardian 1 Information
								</span>
							</div>
						</div>
						<div className="row g-3">
							{/* Add parent/guardian 1 fields here, bind to local state if you want to edit them */}
							<div className="col col-12">
								<CFormInput
									type="text"
									id="parent1_surname" // Example ID
									label="Surname"
									placeholder="Surname"
									value={studentData.parent1_surname || ""} // Assuming this field exists
									disabled={isModal || !isEditing}
									onChange={handleInputChange}
								/>
							</div>
							{/* ... other parent 1 fields ... */}
						</div>
					</div>
				</div>

				{/* Parent / Guardian 2 Information - implement similarly */}
			</div>
		);
	} else if (selectedStudent) {
		return (
			<div className="row d-flex justify-content-center">
				<div className="col col-auto">
					<CSpinner color="info" className="text-center" />
				</div>
			</div>
		);
	} else {
		redirect();
		return (
			<div className="row d-flex justify-content-center">
				<div className="col col-auto">
					<CSpinner color="danger" className="text-center" />
					<p>No Currently Selected Students</p>
				</div>
			</div>
		);
	}
};

export default StudentProfile;
