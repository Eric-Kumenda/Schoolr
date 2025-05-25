import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CRow,
	CFormSelect,
	CTable,
	CTableHead,
	CTableRow,
	CTableHeaderCell,
	CTableBody,
	CTableDataCell,
	CFormInput,
	CAvatar,
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
	CButton,
} from "@coreui/react";
import { useSelector, useDispatch } from "react-redux";
import avatar4 from "./../../assets/images/avatars/4.jpg"; // Placeholder avatar
import {
	fetchSchoolStudents,
	setSelectedStudent,
} from "../../store/schoolSlice";
import StudentProfile from "./StudentProfile";

const ClassList = () => {
	const dispatch = useDispatch();
	const { schoolId } = useSelector((state) => state.auth);
	const { studentsData, loading, error } = useSelector(
		(state) => state.school
	);
	const [selectedCohort, setSelectedCohort] = useState("");
	const [selectedStream, setSelectedStream] = useState("");
	const [searchQuery, setSearchQuery] = useState("");

	const selectedStudent = useSelector(
		(state) => state.school.selectedStudent
	);
	const [modalVisible, setModalVisible] = useState(false);

	useEffect(() => {
		if (schoolId) {
			dispatch(fetchSchoolStudents(schoolId));
		}
	}, [dispatch, schoolId]);

	// Extracting unique cohorts and streams
	const cohorts = useMemo(() => {
		if (!studentsData) return [];
		return [
			...new Set(
				studentsData.map((student) => student.current_study_year)
			),
		].map((current_study_year) => ({
			value: current_study_year.toString(),
			label: `Form ${current_study_year}`,
		}));
	}, [studentsData]);

	const streams = useMemo(() => {
		if (!selectedCohort || !studentsData) return [];
		const filteredStudents = studentsData.filter(
			(student) =>
				student.current_study_year.toString() === selectedCohort
		);
		return [
			...new Set(
				filteredStudents
					.map((student) => student.stream)
					.filter(Boolean)
			),
		].map((stream) => ({ value: stream, label: stream }));
	}, [selectedCohort, studentsData]);

	// Filtered students based on cohort, stream, and search query
	const filteredClassStudents = useMemo(() => {
		let filtered = studentsData?.filter(
			(student) =>
				student.current_study_year.toString() === selectedCohort &&
				student.stream === selectedStream
		);
		if (searchQuery) {
			filtered = filtered.filter((student) =>
				Object.values(student).some((value) =>
					String(value)
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				)
			);
		}
		return filtered;
	}, [studentsData, selectedCohort, selectedStream, searchQuery]);

	// Placeholder class information
	const classInfo = useMemo(() => {
		if (selectedCohort && selectedStream) {
			const filtered = filteredClassStudents;
			return {
				teacherName: "Mr./Ms. Placeholder Teacher",
				teacherContact: "+254 7XXXXXXXXX",
				teacherPhoto: avatar4,
				studentCount: filtered.length,
				classRank: "N/A",
				previousMeanScore: "N/A",
			};
		}
		return {
			teacherName: "",
			teacherContact: "",
			teacherPhoto: null,
			studentCount: 0,
			classRank: "",
			previousMeanScore: "",
		};
	}, [selectedCohort, selectedStream, filteredClassStudents?.length]);

	const calculateAge = (dob) => {
		if (!dob) return "N/A";
		const birthDate = new Date(dob);
		const today = new Date();

		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();

		// Adjust if birthday hasn't occurred yet this year
		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < birthDate.getDate())
		) {
			age--;
		}

		return age;
	};
	const openStudentModal = (student) => {
		dispatch(setSelectedStudent(student));
		setModalVisible(true);
	};

	const closeStudentModal = () => {
		setModalVisible(false);
	};

	if (loading) {
		return <p>Loading class list...</p>;
	}

	if (error) {
		return <p>Error loading class list: {error}</p>;
	}

	return (
		<CRow>
			<CCol xs={12}>
				<CCard className="border-0 shadow">
					<CCardHeader>
						<strong>Class List</strong>
					</CCardHeader>
					<CCardBody>
						<CRow className="mb-3">
							<CCol md={4}>
								<CFormSelect
									label="Select Cohort"
									options={[
										{ value: "", label: "Select Form" },
										...cohorts,
									]}
									value={selectedCohort}
									onChange={(e) => {
										setSelectedCohort(e.target.value);
										setSelectedStream(""); // Reset stream when cohort changes
									}}
								/>
							</CCol>
							<CCol md={4}>
								<CFormSelect
									label="Select Stream"
									options={[
										{ value: "", label: "Select Stream" },
										...streams,
									]}
									value={selectedStream}
									onChange={(e) =>
										setSelectedStream(e.target.value)
									}
									disabled={!selectedCohort}
								/>
							</CCol>
							<CCol md={4}>
								<CFormInput
									type="text"
									label="Search Students"
									placeholder="Enter student info..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									disabled={
										!selectedCohort || !selectedStream
									}
								/>
							</CCol>
						</CRow>

						{selectedCohort && selectedStream ? (
							<div>
								<CRow className="mb-4 border rounded p-3 mx-md-3">
									<CCol md={3} className="text-center">
										<CAvatar
											src={classInfo.teacherPhoto}
											size="xl"
										/>
										<p className="mt-2 fw-bold">
											{classInfo.teacherName}
										</p>
										<p className="text-muted">
											Class Teacher
										</p>
									</CCol>
									<CCol md={9}>
										<div className="d-flex flex-wrap">
											<div className="me-4">
												<p className="mb-0 fw-bold">
													Contact:
												</p>
												<p>
													{classInfo.teacherContact}
												</p>
											</div>
											<div className="me-4">
												<p className="mb-0 fw-bold">
													No. of Students:
												</p>
												<p>{classInfo.studentCount}</p>
											</div>
											<div className="me-4">
												<p className="mb-0 fw-bold">
													Class Rank:
												</p>
												<p>{classInfo.classRank}</p>
											</div>
											<div>
												<p className="mb-0 fw-bold">
													Previous Mean Score:
												</p>
												<p>
													{
														classInfo.previousMeanScore
													}
												</p>
											</div>
										</div>
									</CCol>
								</CRow>

								<h5>
									Students in Form {selectedCohort} -{" "}
									{selectedStream}
								</h5>
								<CTable striped bordered responsive>
									<CTableHead>
										<CTableRow>
											<CTableHeaderCell>
												#
											</CTableHeaderCell>
											<CTableHeaderCell>
												Adm No
											</CTableHeaderCell>
											<CTableHeaderCell>
												Name
											</CTableHeaderCell>
											<CTableHeaderCell>
												House
											</CTableHeaderCell>
											<CTableHeaderCell>
												Dorm
											</CTableHeaderCell>
											<CTableHeaderCell>
												Cube
											</CTableHeaderCell>
											<CTableHeaderCell>
												Age
											</CTableHeaderCell>
											<CTableHeaderCell>
												KCPE Index No.
											</CTableHeaderCell>
										</CTableRow>
									</CTableHead>
									<CTableBody>
										{filteredClassStudents.map(
											(student, index) => (
												<CTableRow key={student.adm_no}>
													<CTableDataCell>
														{index + 1}
													</CTableDataCell>
													<CTableDataCell className="d-flex justify-content-between">
														{student.adm_no}
														<button
															className="btn btn-sm btn-outline-info"
															onClick={() => {
																openStudentModal(
																	student
																);
															}}>
															<i className="fa-regular fa-user"></i>
														</button>
													</CTableDataCell>
													<CTableDataCell>{`${
														student.first_name
													} ${
														student.middle_name ||
														""
													} ${
														student.surname
													}`}</CTableDataCell>
													<CTableDataCell>
														{student.house}
													</CTableDataCell>
													<CTableDataCell>
														{student.dorm}
													</CTableDataCell>
													<CTableDataCell>
														{student.cube}
													</CTableDataCell>
													<CTableDataCell>
														{calculateAge(
															student.DOB
														)}{" "}
														Yrs
													</CTableDataCell>
													<CTableDataCell>
														{student.kcpe_index_no}
													</CTableDataCell>
												</CTableRow>
											)
										)}
									</CTableBody>
								</CTable>
								<p>
									<strong>Total Students:</strong>{" "}
									{filteredClassStudents.length}
								</p>
							</div>
						) : (
							<p>
								Please select a cohort and stream to view the
								class list.
							</p>
						)}

						{/* Student Info Modal remains the same */}
						<CModal
							visible={modalVisible}
							onClose={closeStudentModal}
							size="lg">
							<CModalHeader>
								<CModalTitle>Student Information</CModalTitle>
							</CModalHeader>
							<CModalBody>
								{selectedStudent && (
									<StudentProfile isModal={true} />
								)}
							</CModalBody>
							<CModalFooter>
								<CButton
									color="secondary"
									onClick={closeStudentModal}>
									Close
								</CButton>
							</CModalFooter>
						</CModal>
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
	);
};

export default ClassList;
