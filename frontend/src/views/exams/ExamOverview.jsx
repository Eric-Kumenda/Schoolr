import React, { useEffect } from 'react';
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
    CAlert,
    CSpinner,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getExamResultsByExamId, clearSelectedExamData } from '../../store/schoolSlice'; // Adjust path
import { useParams } from 'react-router-dom';

const ExamOverview = () => {
    const { examId } = useParams();
    const dispatch = useDispatch();
    const { selectedExam, examOverviewResults, examsLoading, examsError } = useSelector((state) => state.school);

    useEffect(() => {
        if (examId) {
            dispatch(getExamResultsByExamId(examId));
        }
        return () => {
            dispatch(clearSelectedExamData()); // Clean up state
        };
    }, [dispatch, examId]);

    // Extract unique subjects to create dynamic table headers
    const uniqueSubjects = [...new Set(examOverviewResults.map(r => r.subject))].sort();

    // Group results by student for easier display
    const resultsByStudent = examOverviewResults.reduce((acc, result) => {
        const studentAdmNo = result.studentId?.adm_no || 'N/A';
        if (!acc[studentAdmNo]) {
            acc[studentAdmNo] = {
                _id: result.studentId?._id,
                adm_no: studentAdmNo,
                name: `${result.studentId?.first_name || ''} ${result.studentId?.surname || ''}`.trim(),
                cohort: result.studentId?.cohort || 'N/A',
                stream: result.studentId?.stream || 'N/A',
                results: {},
            };
        }
        acc[studentAdmNo].results[result.subject] = { marks: result.marks, grade: result.grade, comment: result.comment };
        return acc;
    }, {});

    const sortedStudents = Object.values(resultsByStudent).sort((a, b) => {
        if (a.cohort !== b.cohort) return a.cohort.localeCompare(b.cohort);
        if (a.stream !== b.stream) return a.stream.localeCompare(b.stream);
        return a.adm_no.localeCompare(b.adm_no);
    });


    return (
        <CRow>
            <CCol lg={10}>
                <CCard>
                    <CCardHeader>
                        <strong>Overview of Exam: {selectedExam ? `${selectedExam.examName} (${selectedExam.academicYear} - ${selectedExam.term})` : 'Loading Exam...'}</strong>
                        <br />
                        <small>Status: {selectedExam?.status.toUpperCase()} | Published: {selectedExam?.publishedAt ? new Date(selectedExam.publishedAt).toLocaleDateString() : 'N/A'}</small>
                    </CCardHeader>
                    <CCardBody>
                        {examsError && <CAlert color="danger">{examsError}</CAlert>}

                        {examsLoading === 'pending' ? (
                            <CSpinner />
                        ) : sortedStudents.length === 0 ? (
                            <CAlert color="info">No results found for this exam.</CAlert>
                        ) : (
                            <CTable responsive striped hover className="mt-3">
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Adm No</CTableHeaderCell>
                                        <CTableHeaderCell>Name</CTableHeaderCell>
                                        <CTableHeaderCell>Cohort</CTableHeaderCell>
                                        <CTableHeaderCell>Stream</CTableHeaderCell>
                                        {uniqueSubjects.map(subject => (
                                            <CTableHeaderCell key={subject}>{subject}</CTableHeaderCell>
                                        ))}
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {sortedStudents.map(student => (
                                        <CTableRow key={student._id}>
                                            <CTableDataCell>{student.adm_no}</CTableDataCell>
                                            <CTableDataCell>{student.name}</CTableDataCell>
                                            <CTableDataCell>{student.cohort}</CTableDataCell>
                                            <CTableDataCell>{student.stream}</CTableDataCell>
                                            {uniqueSubjects.map(subject => {
                                                const result = student.results[subject];
                                                return (
                                                    <CTableDataCell key={`${student._id}-${subject}`}>
                                                        {result ? (
                                                            <>
                                                                <strong>{result.marks}</strong> ({result.grade})
                                                                {result.comment && <small className="d-block text-muted">{result.comment}</small>}
                                                            </>
                                                        ) : (
                                                            '-'
                                                        )}
                                                    </CTableDataCell>
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

export default ExamOverview;