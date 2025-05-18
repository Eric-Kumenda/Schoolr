import React, { useEffect, useState } from "react";
import { CAvatar, CButton, CFormInput, CSpinner } from "@coreui/react";
import avatar4 from "../../assets/images/avatars/4.jpg";
import { useDispatch, useSelector } from "react-redux";
import { addToast } from "../../store/toastSlice";
import { updateSchoolTeacher } from "../../store/schoolSlice"; // Implement this action
import { useNavigate } from "react-router-dom";

const TeacherProfile = ({ isModal }) => {
    const navigate = useNavigate()
	const dispatch = useDispatch();
	const selectedTeacher = useSelector(
		(state) => state.school.selectedTeacher
	);
	const schoolId = useSelector((state) => state.auth.schoolId);
	const [teacherData, setTeacherData] = useState(null);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		if (selectedTeacher) {
			setTeacherData({ ...selectedTeacher });
		}
	}, [selectedTeacher]);

	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setTeacherData((prev) => ({ ...prev, [id]: value }));
	};

	const handleEditClick = () => setIsEditing(true);

	const handleSaveClick = async () => {
		const res = await dispatch(
			updateSchoolTeacher({
				teacherData: teacherData,
				schoolId: schoolId,
			})
		);
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
		}
	};

	const handleDiscardClick = () => {
		setTeacherData({ ...selectedTeacher });
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

	if (!teacherData) {
		return <CSpinner color="primary" />;
	}

	return (
		<div className="container-fluid">
			<div className="row mb-4 border shadow rounded ps-5 py-3">
				<div className="col col-auto d-flex justify-content-center">
					<CAvatar src={avatar4} size="md" className="w-100 h-100" />
				</div>
				<div className="col ps-3">
					<p className="fw-bold fs-4 mb-1">
						{`${teacherData.first_name} ${
							teacherData.middle_name || ""
						} ${teacherData.surname}`}
					</p>
					<p>
						Employee Number:{" "}
						<strong>{teacherData.employee_number}</strong>
					</p>
				</div>
			</div>

			<div className="row mb-4 border shadow rounded py-3">
				<div className="col">
					<div className="row mb-3">
						<div className="col d-flex justify-content-end">
							{!isEditing && (
								<CButton
									variant="outline"
									onClick={
										isModal
											? () =>
													navigate(
														"/admin/teachers/profile"
													)
											: handleEditClick
									}>
									<i className="fa-regular fa-pen"></i>
								</CButton>
							)}
						</div>
						<div className="col-12">
							<span className="fw-bold fs-4">
								Teacher Information
							</span>
						</div>
					</div>
					<div className="row g-3">
						<div className="col-md-6">
							<CFormInput
								type="text"
								id="first_name"
								label="First Name"
								value={teacherData.first_name || ""}
								disabled={isModal || !isEditing}
								onChange={handleInputChange}
							/>
						</div>
						<div className="col-md-6">
							<CFormInput
								type="text"
								id="middle_name"
								label="Middle Name"
								value={teacherData.middle_name || ""}
								disabled={isModal || !isEditing}
								onChange={handleInputChange}
							/>
						</div>
						<div className="col-md-6">
							<CFormInput
								type="text"
								id="surname"
								label="Surname"
								value={teacherData.surname || ""}
								disabled={isModal || !isEditing}
								onChange={handleInputChange}
							/>
						</div>
						<div className="col-md-6">
							<CFormInput
								type="text"
								id="kra_pin"
								label="KRA PIN"
								value={teacherData.kra_pin || ""}
								disabled
							/>
						</div>
						<div className="col-md-6">
							<CFormInput
								type="text"
								id="national_id"
								label="National ID"
								value={teacherData.national_id || ""}
								disabled
							/>
						</div>
						{/* Optional: Add subject editing as a comma-separated string */}
					</div>

					{isEditing && !isModal && (
						<div className="d-flex justify-content-end mt-4">
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
					)}
				</div>
			</div>
		</div>
	);
};

export default TeacherProfile;
