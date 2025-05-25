import React, { useEffect, useState } from 'react';
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
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentExamResults, getExams, clearExamState } from '../../store/schoolSlice'; // Adjust path
import { useParams } from 'react-router-dom';

const ViewStudentResults = () => {
    const { studentId } = useParams(); // Get student ID from URL
    const dispatch = useDispatch();
    const { studentExamResults, examsLoading, examsError, exams } = useSelector((state) => state.school);
    // Assuming student data is available somewhere in your store or passed as props if needed
    const studentData = useSelector(state => {
        // This is a placeholder; you'd likely have a way to get the student's name from `studentsData`
        // or fetch it separately. For now, we'll assume it's part of studentExamResults.
        if (studentExamResults && studentExamResults.length > 0) {
            // Find first student in results to get their basic info
            const firstResult = studentExamResults[0];
            return {
                adm_no: firstResult.studentId?.adm_no || 'N/A',
                name: `${firstResult.studentId?.first_name || ''} ${firstResult.studentId?.surname || ''}`.trim() || 'Student',
                cohort: firstResult.studentId?.cohort || 'N/A',
                stream: firstResult.studentId?.stream || 'N/A',
            };
        }
        return null;
    });

    const [selectedExamFilter, setSelectedExamFilter] = useState('');

    useEffect(() => {
        dispatch(getExams()); // Fetch all exams to populate filter dropdown
    }, [dispatch]);

    useEffect(() => {
        if (studentId) {
            dispatch(getStudentExamResults({ studentId, examId: selectedExamFilter || undefined }));
        }
        return () => {
            dispatch(clearExamState()); // Clean up results when component unmounts
        };
    }, [dispatch, studentId, selectedExamFilter]);

    const examOptions = exams.map(exam => ({
        label: `${exam.examName} (${exam.academicYear} - ${exam.term}) - ${exam.status.toUpperCase()}`,
        value: exam._id,
    }));

    return (
        <CRow>
            <CCol xs={12}>
                <CCard>
                    <CCardHeader>
                        <strong>Exam Results for {studentData?.name} ({studentData?.adm_no})</strong>
                        <br/>
                        <small>Cohort: {studentData?.cohort}, Stream: {studentData?.stream}</small>
                    </CCardHeader>
                    <CCardBody>
                        {examsError && <CAlert color="danger">{examsError}</CAlert>}

                        <CRow className="mb-3">
                            <CCol md={6}>
                                <CFormSelect
                                    label="Filter by Exam"
                                    options={[{ label: 'All Exams', value: '' }, ...examOptions]}
                                    value={selectedExamFilter}
                                    onChange={(e) => setSelectedExamFilter(e.target.value)}
                                />
                            </CCol>
                        </CRow>

                        {examsLoading === 'pending' ? (
                            <CSpinner />
                        ) : studentExamResults.length === 0 ? (
                            <CAlert color="info">No exam results found for this student or filter.</CAlert>
                        ) : (
                            <CTable responsive striped hover className="mt-3">
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Exam</CTableHeaderCell>
                                        <CTableHeaderCell>Subject</CTableHeaderCell>
                                        <CTableHeaderCell>Marks</CTableHeaderCell>
                                        <CTableHeaderCell>Grade</CTableHeaderCell>
                                        <CTableHeaderCell>Status</CTableHeaderCell>
                                        <CTableHeaderCell>Comment</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {studentExamResults.map((result) => (
                                        <CTableRow key={result._id}>
                                            <CTableDataCell>
                                                {result.examId?.examName} ({result.examId?.academicYear} - {result.examId?.term})
                                            </CTableDataCell>
                                            <CTableDataCell>{result.subject}</CTableDataCell>
                                            <CTableDataCell>{result.marks}</CTableDataCell>
                                            <CTableDataCell>{result.grade}</CTableDataCell>
                                            <CTableDataCell>
                                                <span className={`badge bg-${result.examId?.status === 'provisional' ? 'warning' : 'success'}`}>
                                                    {result.examId?.status.toUpperCase()}
                                                </span>
                                            </CTableDataCell>
                                            <CTableDataCell>{result.comment || '-'}</CTableDataCell>
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