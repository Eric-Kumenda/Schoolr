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
	CFormInput,
	CFormSelect,
	CFormCheck,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	getStudentsForResultsEntry,
	updateStudentResult,
	clearSelectedExamData,
	getExams,
	clearExamState,
} from "../../store/schoolSlice"; // Adjust path
import { useParams } from "react-router-dom";

// Helper function to calculate grade (match backend logic)
const calculateGrade = (marks) => {
	if (marks === null || marks === undefined || isNaN(marks)) return "-";
	if (marks >= 80) return "A";
	if (marks >= 70) return "B";
	if (marks >= 60) return "C";
	if (marks >= 50) return "D";
	return "E";
};

const ResultsEntry = () => {
	const { examId } = useParams();
	const dispatch = useDispatch();
	const { studentsForResultsEntry, examsLoading, examsError, exams } =
		useSelector((state) => state.school);
	const { role } = useSelector((state) => state.auth); // Get user role

	const [filterCohort, setFilterCohort] = useState("");
	const [filterStream, setFilterStream] = useState("");
	const [marksInput, setMarksInput] = useState({}); // { studentId_subject: marks }
	const [commentsInput, setCommentsInput] = useState({}); // { studentId_subject: comment }
	const [updateSuccess, setUpdateSuccess] = useState("");

	const currentExam = exams?.find(
		(exam) => exam._id.toString() === examId.toString()
	);
	const isExamOfficial = currentExam?.status === "official";
	const canEdit = !isExamOfficial || role === "admin"; // Only admins can edit official results

	useEffect(() => {
		if (exams.length < 1) {
			dispatch(getExams());
		}
		if (examId) {
			dispatch(
				getStudentsForResultsEntry({
					examId: examId,
					cohort: filterCohort,
					stream: filterStream,
				})
			);
		}
		return () => {
			dispatch(clearSelectedExamData()); // Clean up state
		};
	}, [dispatch, examId, exams, filterCohort, filterStream]);

	// Populate initial marks and comments when studentsForResultsEntry changes
	useEffect(() => {
		const initialMarks = {};
		const initialComments = {};
		studentsForResultsEntry.forEach((student) => {
			student.results.forEach((result) => {
				initialMarks[`${student._id}_${result.subject}`] = result.marks;
				initialComments[`${student._id}_${result.subject}`] =
					result.comment || "";
			});
		});
		setMarksInput(initialMarks);
		setCommentsInput(initialComments);
	}, [studentsForResultsEntry]);

	const handleMarksChange = (studentId, subject, value) => {
		setMarksInput((prev) => ({
			...prev,
			[`${studentId}_${subject}`]:
				value === "" ? null : parseInt(value, 10), // Store as null or number
		}));
	};

	const handleCommentsChange = (studentId, subject, value) => {
		setCommentsInput((prev) => ({
			...prev,
			[`${studentId}_${subject}`]: value,
		}));
	};

	const handleUpdateResult = async (studentId, subject) => {
		setUpdateSuccess("");
		const marks = marksInput[`${studentId}_${subject}`];
		const comment = commentsInput[`${studentId}_${subject}`];

		if (
			marks === null ||
			marks === undefined ||
			isNaN(marks) ||
			marks < 0 ||
			marks > 100
		) {
			alert("Please enter valid marks (0-100).");
			return;
		}

		const resultAction = await dispatch(
			updateStudentResult({
				examId,
				studentId,
				resultData: { subject, marks, comment },
			})
		);

		if (updateStudentResult.fulfilled.match(resultAction)) {
			setUpdateSuccess(
				`Result for ${studentAdmNo} (${subject}) updated.`
			);
			// No need to refetch all, Redux state is optimistically updated
		}
		// Error handled by examsError
	};

	const uniqueCohorts = [
		...new Set(studentsForResultsEntry.map((s) => s.cohort)),
	].sort();
	const uniqueStreams = [
		...new Set(studentsForResultsEntry.map((s) => s.stream)),
	].sort();

	// Define all possible subjects (you might fetch this from a configuration or assume a standard set)
	/*const allSubjects = [
		"Mathematics",
		"English",
		"Kiswahili",
		"Biology",
		"Chemistry",
		"Physics",
		"History",
		"Geography",
		"CRE",
		"IRE",
		"HRE",
		"Business Studies",
		"Agriculture",
		"Home Science",
		"Art and Design",
		"Computer Studies",
	].sort();*/

	const allSubjectsSet = new Set();

	studentsForResultsEntry?.forEach((student) => {
		if (Array.isArray(student.subjects)) {
			student.subjects.forEach((subject) => allSubjectsSet.add(subject));
		}
	});
	const allSubjects = Array.from(allSubjectsSet).sort();

	const [visibleSubjects, setVisibleSubjects] = useState(
		Object.fromEntries(allSubjects.map((subject) => [subject, true]))
	);

	const handleSubjectToggle = (subject) => {
		setVisibleSubjects((prev) => ({
			...prev,
			[subject]: !prev[subject],
		}));
	};

	return (
		<CRow>
			<CCol>
				<CCard>
					<CCardHeader>
						<strong>
							Results Entry for:{" "}
							{currentExam ? (
								`${currentExam.examName} (${currentExam.academicYear} - ${currentExam.term})`
							) : (
								<CSpinner
									color="primary"
									size="sm"
									className="ms-2"
								/>
							)}
						</strong>
						<br />
						<small
							className={
								isExamOfficial ? "text-danger" : "text-warning"
							}>
							Status: {currentExam?.status.toUpperCase()}
							{isExamOfficial &&
								" (Editing restricted for official exams)"}
						</small>
					</CCardHeader>
					<CCardBody>
						{updateSuccess && (
							<CAlert color="success">{updateSuccess}</CAlert>
						)}
						{examsError && (
							<CAlert color="danger">{examsError}</CAlert>
						)}

						<CRow className="mb-3">
							<CCol md={4}>
								<CFormSelect
									label="Filter by Cohort"
									options={[
										{ label: "All Cohorts", value: "" },
										...uniqueCohorts.map((c) => ({
											label: c,
											value: c,
										})),
									]}
									value={filterCohort}
									onChange={(e) =>
										setFilterCohort(e.target.value)
									}
								/>
							</CCol>
							<CCol md={4}>
								<CFormSelect
									label="Filter by Stream"
									options={[
										{ label: "All Streams", value: "" },
										...uniqueStreams.map((s) => ({
											label: s,
											value: s,
										})),
									]}
									value={filterStream}
									onChange={(e) =>
										setFilterStream(e.target.value)
									}
								/>
							</CCol>
						</CRow>
						<CRow className="mb-3">
							{allSubjects.map((subject) => (
								<CCol key={subject} className="col-auto">
									<CFormCheck
										type="checkbox"
										label={subject}
										checked={visibleSubjects[subject]}
										onChange={() =>
											handleSubjectToggle(subject)
										}
									/>
								</CCol>
							))}
						</CRow>

						{examsLoading === "pending" ? (
							<CSpinner />
						) : studentsForResultsEntry.length === 0 ? (
							<CAlert color="info">
								No students found for this exam or filters.
								Check if students exist in this school.
							</CAlert>
						) : (
							<CTable responsive striped hover className="mt-3">
								<CTableHead>
									<CTableRow>
										<CTableHeaderCell>
											Adm No
										</CTableHeaderCell>
										<CTableHeaderCell>
											Name
										</CTableHeaderCell>
										<CTableHeaderCell>
											Cohort
										</CTableHeaderCell>
										<CTableHeaderCell>
											Stream
										</CTableHeaderCell>
										{allSubjects
											.filter(
												(subject) =>
													visibleSubjects[subject]
											)
											.map((subject) => (
												<CTableHeaderCell
													key={subject}
													className="w-auto">
													{subject}
												</CTableHeaderCell>
											))}
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{studentsForResultsEntry.map((student) => (
										<CTableRow key={student._id}>
											<CTableDataCell>
												{student.adm_no}
											</CTableDataCell>
											<CTableDataCell>{`${student.first_name} ${student.surname}`}</CTableDataCell>
											<CTableDataCell>
												{student.cohort}
											</CTableDataCell>
											<CTableDataCell>
												{student.stream}
											</CTableDataCell>
											{allSubjects
												.filter(
													(subject) =>
														visibleSubjects[subject]
												)
												.map((subject) => {
													const existingResult =
														student.results.find(
															(r) =>
																r.subject ===
																subject
														);
													const currentMarks =
														marksInput[
															`${student._id}_${subject}`
														] !== null
															? marksInput[
																	`${student._id}_${subject}`
															  ]
															: "";
													const currentComment =
														commentsInput[
															`${student._id}_${subject}`
														] || "";

													return student?.subjects.includes(
														subject
													) ? (
														<CTableDataCell
															key={`${student._id}-${subject}`}>
															<div className="d-flex flex-column">
																<CFormInput
																	type="number"
																	value={
																		currentMarks
																	}
																	onChange={(
																		e
																	) =>
																		handleMarksChange(
																			student._id,
																			subject,
																			e
																				.target
																				.value
																		)
																	}
																	placeholder="Marks"
																	max={100}
																	min={0}
																	size="sm"
																	className="mb-1 w-auto no-spinner"
																	disabled={
																		!canEdit
																	}
																/>
																<CFormInput
																	type="text"
																	className="d-none"
																	value={
																		currentComment
																	}
																	onChange={(
																		e
																	) =>
																		handleCommentsChange(
																			student._id,
																			subject,
																			e
																				.target
																				.value
																		)
																	}
																	placeholder="Comment (Opt)"
																	size="sm"
																	disabled={
																		!canEdit
																	}
																/>
																<small className="text-muted">
																	Grade:{" "}
																	{calculateGrade(
																		currentMarks
																	)}
																</small>
																<CButton
																	color="primary"
																	size="sm"
																	onClick={() =>
																		handleUpdateResult(
																			student._id,
																			subject
																		)
																	}
																	disabled={
																		examsLoading ===
																			"pending" ||
																		!canEdit
																	}
																	className="mt-1">
																	Save
																</CButton>
															</div>
														</CTableDataCell>
													) : (
														<CTableDataCell
															key={`${student._id}${subject}`}></CTableDataCell>
													);
												})}
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

export default ResultsEntry;
