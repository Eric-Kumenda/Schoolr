import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CForm,
	CFormInput,
	CFormLabel,
	CFormSelect,
	CFormTextarea,
	CRow,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { createSchoolProfile } from "../../../store/schoolSlice";

const CreateSchool = () => {
	const userId = useSelector((state) => state.auth.userId);
	const [formData, setFormData] = useState({
		userId: userId,
		name: "",
		color: "#F75C08",
		location: "",
		motto: "",
		aim: "",
		email: "",
		phone: "",
		logo: null,
		logoPreview: null,
		type: "private",
		accreditation: "none",
		establishedYear: 1960,
		gender: "mixed",
	});
		const dispatch = useDispatch();
		const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Dispatch the createSchoolProfile action with the form data
		try {
			const res = await dispatch(createSchoolProfile(formData));
			if (res?.payload.message) {
			alert(res.payload.message+": "+res.payload.schoolId);
			navigate("/admin"); // Redirect to admin dashboard
			}
		} catch (err) {
			console.error(err);
			alert("Failed to create school");
		}
	};

	return (
		<>
			<CRow className="d-flex justify-content-center mb-4">
				<CCol xs={12} md={8}>
					<CCard className="mb-4">
						<CCardHeader>
							<p className="text-center py-1 mb-0">
								<strong>Create School Profile</strong>
							</p>
						</CCardHeader>
						<CCardBody>
							<CForm onSubmit={handleSubmit}>
								{/* School Title */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolTitleInput">
										School Title
									</CFormLabel>
									<CFormInput
										type="text"
										id="schoolTitleInput"
										placeholder="St. Gregory High School"
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										required
									/>
								</div>

								{/* School Logo */}
								{/* <div className="mb-3">
									<CFormLabel htmlFor="schoolLogoInput">
										School Logo
									</CFormLabel>
									<CFormInput
										type="file"
										id="schoolLogoInput"
										accept="image/*"
										onChange={(e) => {
											const file = e.target.files[0];
											if (file) {
												setFormData({
													...formData,
													logo: file,
													logoPreview:
														URL.createObjectURL(
															file
														),
												});
											}
										}}
										
									/>
									{formData.logoPreview && (
										<div className="d-flex justify-content-center w-100 py-2">
											<img
												src={formData.logoPreview}
												alt="School Logo Preview"
												className="img-fluid"
												style={{
													maxHeight: "100px",
												}}
											/>
										</div>
									)}
								</div> */}

								{/* Theme Color */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolColorInput">
										School Theme Color
									</CFormLabel>
									<CFormInput
										type="color"
										id="schoolColorInput"
										value={formData.color}
										onChange={(e) =>
											setFormData({
												...formData,
												color: e.target.value,
											})
										}
										title="Choose your school color"
										required
									/>
								</div>
								<div className="mb-3">
									<CFormLabel htmlFor="schoolTypeInput">
										School Type
									</CFormLabel>
									<CFormSelect
										id="schoolTypeInput"
										value={formData.type}
										required
										onChange={(e) =>
											setFormData({
												...formData,
												type: e.target.value,
											})
										}>
										<option value="private">Private</option>
										<option value="public">Public</option>
									</CFormSelect>
								</div>
								<div className="mb-3">
									<CFormLabel htmlFor="schoolAccreditationInput">
										School Accreditation
									</CFormLabel>
									<CFormSelect
										id="schoolAccreditationInput"
										value={formData.accreditation}
										required
										onChange={(e) =>
											setFormData({
												...formData,
												accreditation: e.target.value,
											})
										}>
										<option value="none">
											None (Private)
										</option>
										<option value="sub-county">
											Sub-County
										</option>
										<option value="county">County</option>
										<option value="extra-county">
											Extra-County
										</option>
										<option value="national">
											National
										</option>
										<option value="international">
											International
										</option>
									</CFormSelect>
								</div>
								<div className="mb-3">
									<CFormLabel htmlFor="schoolEstablishedInput">
										Year Established
									</CFormLabel>
									<CFormInput
										type="number"
										id="schoolEstablishedInput"
										placeholder="1995"
										required
										value={formData.establishedYear}
										onChange={(e) =>
											setFormData({
												...formData,
												establishedYear: e.target.value,
											})
										}
									/>
								</div>
								<div className="mb-3">
									<CFormLabel htmlFor="schoolGenderInput">
										School Gender
									</CFormLabel>
									<CFormSelect
										id="schoolGenderInput"
										value={formData.gender}
										required
										onChange={(e) =>
											setFormData({
												...formData,
												gender: e.target.value,
											})
										}>
										<option value="mixed">Mixed</option>
										<option value="boys">Boys</option>
										<option value="girls">Girls</option>
									</CFormSelect>
								</div>

								{/* Location */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolLocationInput">
										School Location
									</CFormLabel>
									<CFormInput
										type="text"
										id="schoolLocationInput"
										placeholder="Nairobi"
										value={formData.location}
										required
										onChange={(e) =>
											setFormData({
												...formData,
												location: e.target.value,
											})
										}
									/>
								</div>

								{/* Email */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolEmailInput">
										School Email
									</CFormLabel>
									<CFormInput
										type="email"
										id="schoolEmailInput"
										placeholder="contact@gregoryhigh.edu"
										value={formData.email}
										required
										onChange={(e) =>
											setFormData({
												...formData,
												email: e.target.value,
											})
										}
									/>
								</div>

								{/* Phone */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolPhoneInput">
										School Phone
									</CFormLabel>
									<CFormInput
										type="tel"
										id="schoolPhoneInput"
										placeholder="+254 xxx-xxx-xxx"
										required
										value={formData.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												phone: e.target.value,
											})
										}
									/>
								</div>

								{/* Motto */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolMottoInput">
										School Motto
									</CFormLabel>
									<CFormTextarea
										id="schoolMottoInput"
										rows={2}
										required
										value={formData.motto}
										onChange={(e) =>
											setFormData({
												...formData,
												motto: e.target.value,
											})
										}
									/>
								</div>

								{/* Aim */}
								<div className="mb-3">
									<CFormLabel htmlFor="schoolAimInput">
										School Aim
									</CFormLabel>
									<CFormTextarea
										id="schoolAimInput"
										rows={2}
										required
										value={formData.aim}
										onChange={(e) =>
											setFormData({
												...formData,
												aim: e.target.value,
											})
										}
									/>
								</div>
								<div className="my-2 w-100 d-flex justify-content-center">
									<button
										type="submit"
										className="btn btn-primary">
										Confirm
									</button>
								</div>
							</CForm>
						</CCardBody>
					</CCard>
				</CCol>
			</CRow>
		</>
	);
};

export default CreateSchool;
