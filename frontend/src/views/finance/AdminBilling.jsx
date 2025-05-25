import React, { useState } from "react";
import {
	CButton,
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CForm,
	CFormInput,
	CFormSelect,
	CRow,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { billCohort, billStudent } from "../../store/schoolSlice"; // Adjust path

const AdminBilling = () => {
	const dispatch = useDispatch();
	const [billType, setBillType] = useState("cohort");
	const [cohortId, setCohortId] = useState("");
	const [studentId, setStudentId] = useState("");
	const [description, setDescription] = useState("");
	const [amount, setAmount] = useState("");
	const [dueDate, setDueDate] = useState("");
	const { billingLoading, billingError } = useSelector(
		(state) => state.school
	);
	const studentsData = useSelector((state) => state.school.studentsData); // Assuming you have this

	const cohorts = studentsData
		? [...new Set(studentsData.map((c) => c.cohort))].map((cohort) => ({
				value: cohort,
				label: `Form ${cohort}`,
		  }))
		: [];
	const allStudents = studentsData
		? studentsData.reduce((acc, cohort) => [...acc, ...cohort.students], [])
		: [];
	const studentOptions = allStudents.map((student) => ({
		value: student._id,
		label: `${student.first_name} ${student.surname} (${student.adm_no})`,
	}));

	const handleBill = () => {
		if (billType === "cohort" && cohortId && description && amount) {
			dispatch(
				billCohort({
					cohortId,
					billingData: { description, amount, dueDate },
				})
			);
		} else if (
			billType === "student" &&
			studentId &&
			description &&
			amount
		) {
			dispatch(
				billStudent({
					studentId,
					billingData: { description, amount, dueDate },
				})
			);
		} else {
			alert("Please fill in all required fields.");
		}
	};

	return (
		<CRow>
			<CCol md={6}>
				<CCard>
					<CCardHeader>
						<strong>Create Billing</strong>
					</CCardHeader>
					<CCardBody>
						<CForm>
							<CRow className="mb-3">
								<CCol md={6}>
									<CFormSelect
										label="Bill Type"
										options={[
											{
												value: "cohort",
												label: "Bill Cohort",
											},
											{
												value: "student",
												label: "Bill Student",
											},
										]}
										value={billType}
										onChange={(e) =>
											setBillType(e.target.value)
										}
									/>
								</CCol>
							</CRow>

							{billType === "cohort" && (
								<CRow className="mb-3">
									<CCol md={6}>
										<CFormSelect
											label="Select Cohort"
											options={[
												{
													value: "",
													label: "Select Form",
												},
												...cohorts,
											]}
											value={cohortId}
											onChange={(e) =>
												setCohortId(e.target.value)
											}
											required
										/>
									</CCol>
								</CRow>
							)}

							{billType === "student" && (
								<CRow className="mb-3">
									<CCol md={6}>
										<CFormSelect
											label="Select Student"
											options={[
												{
													value: "",
													label: "Select Student",
												},
												...studentOptions,
											]}
											value={studentId}
											onChange={(e) =>
												setStudentId(e.target.value)
											}
											required
										/>
									</CCol>
								</CRow>
							)}

							<CRow className="mb-3">
								<CCol md={12}>
									<CFormInput
										type="text"
										label="Description"
										value={description}
										onChange={(e) =>
											setDescription(e.target.value)
										}
										required
									/>
								</CCol>
							</CRow>
							<CRow className="mb-3">
								<CCol md={6}>
									<CFormInput
										type="number"
										label="Amount"
										value={amount}
										onChange={(e) =>
											setAmount(e.target.value)
										}
										required
									/>
								</CCol>
								<CCol md={6}>
									<CFormInput
										type="date"
										label="Due Date (Optional)"
										value={dueDate}
										onChange={(e) =>
											setDueDate(e.target.value)
										}
									/>
								</CCol>
							</CRow>
							<CButton
								color="primary"
								onClick={handleBill}
								disabled={billingLoading === "pending"}>
								{billingLoading === "pending"
									? "Creating..."
									: "Create Billing"}
							</CButton>
							{billingError && (
								<p className="text-danger mt-2">
									{billingError}
								</p>
							)}
						</CForm>
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
	);
};

export default AdminBilling;