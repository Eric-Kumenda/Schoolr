import React, { useEffect, useState, useMemo } from "react";
import {
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CRow,
	CTable,
	CTableHead,
	CTableRow,
	CTableHeaderCell,
	CTableBody,
	CTableDataCell,
	CFormInput,
	CSpinner,
	CButton,
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSchoolTeachers, setSelectedTeacher } from "../../store/schoolSlice";
import TeacherProfile from "./TeacherProfile";

const TeachersList = () => {
	const dispatch = useDispatch();
	const schoolId = useSelector((state) => state.auth.schoolId);
	const {
		teachersData,
		fetchSchoolTeachersLoading,
		fetchSchoolTeachersError,
	} = useSelector((state) => state.school);

	const [searchQuery, setSearchQuery] = useState("");
	const [modalVisible, setModalVisible] = useState(false);

	const openTeacherModal = (teacher) => {
		dispatch(setSelectedTeacher(teacher));
		setModalVisible(true);
	};
	const closeTeacherModal = () => setModalVisible(false);

	useEffect(() => {
		if (schoolId) {
			dispatch(fetchSchoolTeachers(schoolId));
		}
	}, [dispatch, schoolId]);

	const filteredTeachers = useMemo(() => {
		if (!teachersData) return [];
		return teachersData.filter((teacher) => {
			const values = [
				teacher.first_name,
				teacher.middle_name,
				teacher.surname,
				teacher.employee_number,
				...(teacher.subjects_taught || []),
			]
				.join(" ")
				.toLowerCase();
			return values.includes(searchQuery.toLowerCase());
		});
	}, [teachersData, searchQuery]);

	if (fetchSchoolTeachersLoading) {
		return (
			<div className="text-center">
				<CSpinner color="primary" />
			</div>
		);
	}

	if (fetchSchoolTeachersError) {
		return <p>Error loading teachers: {fetchSchoolTeachersError}</p>;
	}

	return (
		<>
			<CRow>
				<CCol xs={12}>
					<CCard className="shadow border-0">
						<CCardHeader>
							<strong>School Teachers</strong>
						</CCardHeader>
						<CCardBody>
							<CRow className="mb-3">
								<CCol md={6}>
									<CFormInput
										type="text"
										label="Search Teachers"
										placeholder="Enter teacher name or subject..."
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
									/>
								</CCol>
							</CRow>
							<CTable striped hover bordered responsive>
								<CTableHead>
									<CTableRow>
										<CTableHeaderCell>
											Emp. No
										</CTableHeaderCell>
										<CTableHeaderCell>
											Name
										</CTableHeaderCell>
										<CTableHeaderCell>
											Subjects Taught
										</CTableHeaderCell>
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{filteredTeachers.map((teacher) => (
										<CTableRow
											key={teacher.employee_number}>
											<CTableDataCell className="d-flex justify-content-between">
												{teacher.employee_number}
												<button
													className="btn btn-sm btn-outline-info"
													onClick={() =>
														openTeacherModal(
															teacher
														)
													}
													aria-label={`View profile of ${teacher.first_name}`}>
													<i className="fa-regular fa-user"></i>
												</button>
											</CTableDataCell>
											<CTableDataCell>
												{teacher.first_name}{" "}
												{teacher.middle_name || ""}{" "}
												{teacher.surname}
											</CTableDataCell>
											<CTableDataCell>
												{(
													teacher.subjects_taught ||
													[]
												).join(", ")}
											</CTableDataCell>
										</CTableRow>
									))}
								</CTableBody>
							</CTable>
							<p>
								<strong>Total Teachers:</strong>{" "}
								{filteredTeachers.length}
							</p>
						</CCardBody>
					</CCard>
				</CCol>
			</CRow>
			<CModal
				visible={modalVisible}
				onClose={closeTeacherModal}
				size="lg">
				<CModalHeader>
					<CModalTitle>Teacher Profile</CModalTitle>
				</CModalHeader>
				<CModalBody>
					<TeacherProfile isModal={true} />
				</CModalBody>
				<CModalFooter>
					<CButton color="secondary" onClick={closeTeacherModal}>
						Close
					</CButton>
				</CModalFooter>
			</CModal>
		</>
	);
};

export default TeachersList;
