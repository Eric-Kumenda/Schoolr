import React, { useState, useEffect, useCallback, useMemo } from "react";
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
	CFormSelect,
	CFormInput,
	CButton,
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
	CContainer,
	CAvatar,
	CSpinner,
} from "@coreui/react";
import { useSelector, useDispatch } from "react-redux";
import {
	fetchSchoolStudents,
	setSelectedStudent,
} from "../../store/schoolSlice";
import StudentProfile from "./StudentProfile";

const StudentList = () => {
	const dispatch = useDispatch();
	const schoolId = useSelector((state) => state.auth.schoolId);
	const {
		studentsData,
		fetchSchoolStudentsLoading,
		fetchSchoolStudentsError,
	} = useSelector((state) => state.school); // Renamed to studentsData
	const [filterStream, setFilterStream] = useState("");
	const [filterDorm, setFilterDorm] = useState("");
	const [filterHouse, setFilterHouse] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const selectedStudent = useSelector(
		(state) => state.school.selectedStudent
	);
	const [modalVisible, setModalVisible] = useState(false);
	const [allStudents, setAllStudents] = useState([]); // State to hold the flattened student list

	useEffect(() => {
		if (schoolId) {
			dispatch(fetchSchoolStudents(schoolId));
		}
	}, [dispatch, schoolId]);

	useEffect(() => {
		if (studentsData) {
			setAllStudents(studentsData);
		}
	}, [studentsData]);

	const filteredStudents = useMemo(() => {
		if (!allStudents) return [];

		return allStudents.filter((student) => {
			const streamMatch =
				!filterStream || student.stream === filterStream;
			const dormMatch = !filterDorm || student.dorm === filterDorm;
			const houseMatch = !filterHouse || student.house === filterHouse;
			const searchMatch =
				!searchQuery ||
				[
					student.adm_no,
					student.first_name,
					student.middle_name,
					student.surname,
					student.stream,
					student.dorm,
					student.house,
					student.kcpe_index_no,
					student.nemis_no,
					student.nhif_no,
				].some((value) =>
					String(value)
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
				);
			return streamMatch && dormMatch && houseMatch && searchMatch;
		});
	}, [allStudents, filterStream, filterDorm, filterHouse, searchQuery]);

	const groupedStudents = useMemo(() => {
		if (!filteredStudents) return {};
		return filteredStudents.reduce((acc, student) => {
			const year = `Form ${student.current_study_year}`;
			acc[year] = acc[year] || [];
			acc[year].push(student);
			return acc;
		}, {});
	}, [filteredStudents]);

	const openStudentModal = (student) => {
		dispatch(setSelectedStudent(student));
		setModalVisible(true);
	};

	const closeStudentModal = () => {
		setModalVisible(false);
	};

	const allStreams = useMemo(
		() => [...new Set(allStudents?.map((s) => s.stream).filter(Boolean))],
		[allStudents]
	);
	const allDorms = useMemo(
		() => [...new Set(allStudents?.map((s) => s.dorm).filter(Boolean))],
		[allStudents]
	);
	const allHouses = useMemo(
		() => [...new Set(allStudents?.map((s) => s.house).filter(Boolean))],
		[allStudents]
	);

	if (fetchSchoolStudentsLoading) {
		return (
			<div className="row d-flex justify-content-center">
				<CSpinner color="body" />
			</div>
		);
	}

	if (fetchSchoolStudentsError) {
		return <p>Error loading students: {fetchSchoolStudentsError}</p>;
	}

	return (
		<CRow>
			<CCol xs={12}>
				<CCard className="border-0 shadow bg-body">
					<CCardHeader>
						<strong>School Students</strong>
					</CCardHeader>
					<CCardBody>
						<CRow className="mb-3">
							{/* Filter and Search components remain the same */}
							<CCol md={4}>
								<CFormSelect
									label="Filter by Stream"
									value={filterStream}
									onChange={(e) =>
										setFilterStream(e.target.value)
									}>
									<option value="">All Streams</option>
									{allStreams.map((stream) => (
										<option key={stream} value={stream}>
											{stream}
										</option>
									))}
								</CFormSelect>
							</CCol>
							<CCol md={4}>
								<CFormSelect
									label="Filter by House"
									value={filterHouse}
									onChange={(e) =>
										setFilterHouse(e.target.value)
									}>
									<option value="">All Houses</option>
									{allHouses.map((house) => (
										<option key={house} value={house}>
											{house}
										</option>
									))}
								</CFormSelect>
							</CCol>
							<CCol md={4}>
								<CFormSelect
									label="Filter by Dorm"
									value={filterDorm}
									onChange={(e) =>
										setFilterDorm(e.target.value)
									}>
									<option value="">All Dorms</option>
									{allDorms.map((dorm) => (
										<option key={dorm} value={dorm}>
											{dorm}
										</option>
									))}
								</CFormSelect>
							</CCol>
						</CRow>
						<CRow className="mb-3">
							<CCol>
								<CFormInput
									type="text"
									label="Search Students"
									placeholder="Enter student info..."
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
								/>
							</CCol>
						</CRow>

						{Object.keys(groupedStudents)
							.sort()
							.map((year) => (
								<div key={year} className="my-4">
									<h5 className="text-center">{year}</h5>
									<CTable striped bordered responsive hover>
										<CTableHead>
											<CTableRow>
												<CTableHeaderCell>
													Adm No
												</CTableHeaderCell>
												<CTableHeaderCell>
													Name
												</CTableHeaderCell>
												<CTableHeaderCell>
													Stream
												</CTableHeaderCell>
												<CTableHeaderCell>
													Dorm
												</CTableHeaderCell>
												<CTableHeaderCell>
													House
												</CTableHeaderCell>
												{/* Add other relevant columns */}
											</CTableRow>
										</CTableHead>
										<CTableBody>
											{groupedStudents[year].map(
												(student) => (
													<CTableRow
														key={student.adm_no}>
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
															{student.stream}
														</CTableDataCell>
														<CTableDataCell>
															{student.dorm}
														</CTableDataCell>
														<CTableDataCell>
															{student.house}
														</CTableDataCell>
														{/* Add other relevant data cells */}
													</CTableRow>
												)
											)}
										</CTableBody>
									</CTable>
								</div>
							))}

						<p>
							<strong>Total Students:</strong>{" "}
							{filteredStudents.length}
						</p>

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

export default StudentList;
