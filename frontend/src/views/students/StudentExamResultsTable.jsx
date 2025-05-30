import React, { useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CAlert,
    CFormSelect,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getExamsListForDropdown,
    getStudentExamResultsForExam,
    setSelectedExamId,
    clearExamsListState,
    clearStudentExamResultsState
} from '../../store/schoolSlice'; // Adjust path

const StudentExamResultsTable = ({ studentId }) => {
    const dispatch = useDispatch();
    const {
        examsList,
        examsListLoading,
        examsListError,
        studentExamResults,
        studentExamResultsLoading,
        studentExamResultsError,
        selectedExamId,
    } = useSelector((state) => state.school);

    // Fetch list of exams on component mount
    useEffect(() => {
        dispatch(getExamsListForDropdown());
        return () => {
            dispatch(clearExamsListState());
            dispatch(clearStudentExamResultsState());
        };
    }, [dispatch]);

    // Fetch results when selectedExamId or studentId changes
    useEffect(() => {
        if (studentId && selectedExamId) {
            dispatch(getStudentExamResultsForExam({ studentId, examId: selectedExamId }));
        }
    }, [dispatch, studentId, selectedExamId]);

    // Handle dropdown selection change
    const handleExamChange = (e) => {
        dispatch(setSelectedExamId(e.target.value));
    };

    // Determine current exam name for display
    const currentExamName = examsList.find(exam => exam._id === selectedExamId)?.examName || 'Select an Exam';

    return (
        <CCol xs={12}>
            <CCard className="mb-4">
                <CCardHeader>
                    <CRow className="align-items-center">
                        <CCol xs={6}>
                            <strong>Exam Results for {studentId}</strong> {/* Replace with actual student name if available in Redux */}
                        </CCol>
                        <CCol xs={6} className="text-end">
                            <CFormSelect
                                value={selectedExamId || ''}
                                onChange={handleExamChange}
                                disabled={examsListLoading === 'pending'}
                            >
                                {examsListLoading === 'pending' && <option>Loading Exams...</option>}
                                {examsListError && <option>Error loading exams</option>}
                                {!examsListLoading && examsList.length === 0 && <option>No Exams Available</option>}
                                {examsList.map((exam) => (
                                    <option key={exam._id} value={exam._id}>
                                        {exam.examName} ({new Date(exam.examDate).toLocaleDateString()})
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody>
                    {studentExamResultsLoading === 'pending' ? (
                        <div className="text-center"><CSpinner color="primary" /></div>
                    ) : studentExamResultsError ? (
                        <CAlert color="danger">{studentExamResultsError}</CAlert>
                    ) : studentExamResults.length === 0 ? (
                        <CAlert color="info">No results found for {currentExamName} for this student.</CAlert>
                    ) : (
                        <CTable bordered hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell scope="col">Subject</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Marks</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Grade</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Comment</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {studentExamResults.map((result, index) => (
                                    <CTableRow key={index}>
                                        <CTableDataCell>{result.subject}</CTableDataCell>
                                        <CTableDataCell>{result.marks !== null ? result.marks.toFixed(2) : 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{result.grade || 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{result.comment || '-'}</CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                    )}
                </CCardBody>
            </CCard>
        </CCol>
    );
};

export default StudentExamResultsTable;