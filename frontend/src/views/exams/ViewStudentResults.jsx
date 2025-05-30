import React, { useEffect, useState } from "react";
import {
	CButton,
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
	CAlert,
	CSpinner,
	CFormSelect,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	getStudentExamResults,
	getExams,
	clearExamState,
} from "../../store/schoolSlice"; // Adjust path
// import { useParams } from 'react-router-dom';

const ViewStudentResults = ({ studentId }) => {
	// const { studentId } = useParams(); // Get student ID from URL
	const dispatch = useDispatch();
	const { studentExamResults, examsLoading, examsError, exams } = useSelector(
		(state) => state.school
	);

	const [selectedExamFilter, setSelectedExamFilter] = useState("");

	useEffect(() => {
		dispatch(getExams()); // Fetch all exams to populate filter dropdown
	}, [dispatch]);

	useEffect(() => {
		if (studentId) {
			dispatch(
				getStudentExamResults({
					studentId,
					examId: selectedExamFilter || undefined,
				})
			);
		}
		return () => {
			dispatch(clearExamState()); // Clean up results when component unmounts
		};
	}, [dispatch, studentId, selectedExamFilter]);
	// Assuming student data is available somewhere in your store or passed as props if needed
	const studentData = useSelector((state) => {
		// This is a placeholder; you'd likely have a way to get the student's name from `studentsData`
		// or fetch it separately. For now, we'll assume it's part of studentExamResults.
		if (studentExamResults?.studentResults && studentExamResults?.studentResults?.length > 0) {
			// Find first student in results to get their basic info
			const firstResult = studentExamResults?.studentDetails;
			return {
				adm_no: firstResult?.adm_no || "N/A",
				name:
					`${firstResult?.first_name || ""} ${
						firstResult?.surname || ""
					}`.trim() || "Student",
				current_study_year: firstResult?.current_study_year || "N/A",
				stream: firstResult?.stream || "N/A",
			};
		}
		return null;
	});

	const examOptions = exams.map((exam) => ({
		label: `${exam.examName} (${exam.academicYear} - ${
			exam.term
		}) - ${exam.status.toUpperCase()}`,
		value: exam._id,
	}));

	return (
		<CRow className="my-2">
			<CCol>
				<CCard className="shadow">
					<CCardHeader className="py-2">
						<strong>
							Exam Results for{" "}
							{studentData ? studentData?.name : null} (
							{studentData ? studentData?.adm_no : null})
						</strong>
						<br />
						<small>
							Form:{" "}
							{studentData
								? studentData?.current_study_year
								: null}
							, Stream: {studentData ? studentData?.stream : null}
						</small>
					</CCardHeader>
					<CCardBody>
						{examsError && (
							<CAlert color="danger">{examsError}</CAlert>
						)}

						<CRow className="mb-3">
							<CCol md={6}>
								<CFormSelect
									label="Filter by Exam"
									options={[
										{ label: "All Exams", value: "" },
										...examOptions,
									]}
									value={selectedExamFilter}
									onChange={(e) =>
										setSelectedExamFilter(e.target.value)
									}
								/>
							</CCol>
						</CRow>

						{examsLoading === "pending" ? (
							<CSpinner />
						) : studentExamResults?.studentResults?.length === 0 ? (
							<CAlert color="info">
								No exam results found for this student or
								filter.
							</CAlert>
						) : (
							<CTable responsive striped hover className="mt-3">
								<CTableHead>
									<CTableRow>
										<CTableHeaderCell>
											Exam
										</CTableHeaderCell>
										<CTableHeaderCell>
											Subject
										</CTableHeaderCell>
										<CTableHeaderCell>
											Marks
										</CTableHeaderCell>
										<CTableHeaderCell>
											Grade
										</CTableHeaderCell>
										<CTableHeaderCell>
											Status
										</CTableHeaderCell>
										<CTableHeaderCell>
											Comment
										</CTableHeaderCell>
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{studentExamResults?.studentResults?.map((result) => (
										<CTableRow key={result._id}>
											<CTableDataCell>
												{result.examId?.examName} (
												{result.examId?.academicYear} -{" "}
												{result.examId?.term})
											</CTableDataCell>
											<CTableDataCell>
												{result.subject}
											</CTableDataCell>
											<CTableDataCell>
												{result.marks}
											</CTableDataCell>
											<CTableDataCell>
												{result.grade}
											</CTableDataCell>
											<CTableDataCell>
												<span
													className={`badge bg-${
														result.examId
															?.status ===
														"provisional"
															? "warning"
															: "success"
													}`}>
													{result.examId?.status.toUpperCase()}
												</span>
											</CTableDataCell>
											<CTableDataCell>
												{result.comment || "-"}
											</CTableDataCell>
										</CTableRow>
									))}
								</CTableBody>
							</CTable>
						)}
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
	);
};

export default ViewStudentResults;
