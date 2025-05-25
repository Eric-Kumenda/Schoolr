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
import { getExams, setExamOfficial, clearExamState } from '../../store/schoolSlice'; // Adjust path
import { Link, useNavigate } from 'react-router-dom'; // For navigation

const ManageExams = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { exams, examsLoading, examsError } = useSelector((state) => state.school);
    const { role } = useSelector((state) => state.auth); // Assuming role is available

    const [selectedExamId, setSelectedExamId] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        dispatch(getExams());
        return () => {
            dispatch(clearExamState()); // Clean up state when component unmounts
        };
    }, [dispatch]);

    const handleSetOfficial = async (examId) => {
        setSuccessMessage('');
        if (window.confirm('Are you sure you want to set this exam as OFFICIAL? This action is usually irreversible.')) {
            const resultAction = await dispatch(setExamOfficial(examId));
            if (setExamOfficial.fulfilled.match(resultAction)) {
                setSuccessMessage('Exam status set to OFFICIAL successfully!');
                // Optionally refetch exams to ensure UI is up-to-date, though thunk already updates state
            }
        }
    };

    const handleViewResultsEntry = () => {
        if (selectedExamId && (role==='admin' || role==='teacher')) {
            navigate({pathname:`/results/entry/${selectedExamId}`, replace: true}); // Navigate to results entry page
        } else {
            alert('Please select an exam first.');
        }
    };

    const handleViewExamOverview = () => {
        if (selectedExamId && (role==='admin' || role==='teacher')) {
            navigate({pathname: `${role==='admin'?'admin':'teacher'}/results/overview/${selectedExamId}`, replace: true}); // Navigate to exam overview page
        } else {
            alert('Please select an exam first.');
        }
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Manage Exams</strong>
                    </CCardHeader>
                    <CCardBody>
                        {successMessage && <CAlert color="success">{successMessage}</CAlert>}
                        {examsError && <CAlert color="danger">{examsError}</CAlert>}

                        {examsLoading === 'pending' ? (
                            <CSpinner />
                        ) : exams.length === 0 ? (
                            <CAlert color="info">No exams found. Admins can create new exams.</CAlert>
                        ) : (
                            <>
                                <CRow className="mb-3 align-items-end">
                                    <CCol md={6}>
                                        <CFormSelect
                                        className={!selectedExamId&&'border border-warning'}
                                            label="Select Exam for Action"
                                            value={selectedExamId}
                                            feedback="Please select an exam"
                                            invalid={!selectedExamId}
                                            onChange={(e) => setSelectedExamId(e.target.value)}
                                            options={[
                                                { label: 'Choose an Exam...', value: '', disabled: true },
                                                ...exams.map(exam => ({
                                                    label: `${exam.examName} (${exam.academicYear} - ${exam.term}) - ${exam.status.toUpperCase()}`,
                                                    value: exam._id,
                                                })),
                                            ]}
                                        />
                                    </CCol>
                                    <CCol md={6} className="d-flex justify-content-end">
                                        <CButton color="info" as={Link} to={selectedExamId&& (role==='admin' || role==='teacher')?`/${role}/results/entry/${selectedExamId}`:null} /*onClick={handleViewResultsEntry}*/ disabled={!selectedExamId} className="me-2">
                                            Enter/Edit Results
                                        </CButton>
                                        <CButton color="dark" as={Link} to={selectedExamId&& (role==='admin' || role==='teacher')?`/${role}/results/overview/${selectedExamId}`:null} /*onClick={handleViewExamOverview}*/ disabled={!selectedExamId}>
                                            View Exam Overview
                                        </CButton>
                                    </CCol>
                                </CRow>

                                <CTable responsive striped hover className="mt-3">
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Exam Name</CTableHeaderCell>
                                            <CTableHeaderCell>Academic Year</CTableHeaderCell>
                                            <CTableHeaderCell>Term</CTableHeaderCell>
                                            <CTableHeaderCell>Date</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            {role === 'admin' && <CTableHeaderCell>Actions</CTableHeaderCell>}
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {exams.map((exam) => (
                                            <CTableRow key={exam._id}>
                                                <CTableDataCell>{exam.examName}</CTableDataCell>
                                                <CTableDataCell>{exam.academicYear}</CTableDataCell>
                                                <CTableDataCell>{exam.term}</CTableDataCell>
                                                <CTableDataCell>{new Date(exam.examDate).toLocaleDateString()}</CTableDataCell>
                                                <CTableDataCell>
                                                    <span className={`badge bg-${exam.status === 'provisional' ? 'warning' : 'success'}`}>
                                                        {exam.status.toUpperCase()}
                                                    </span>
                                                </CTableDataCell>
                                                {role === 'admin' && (
                                                    <CTableDataCell>
                                                        {exam.status === 'provisional' ? (
                                                            <CButton
                                                                color="success"
                                                                size="sm"
                                                                onClick={() => handleSetOfficial(exam._id)}
                                                                disabled={examsLoading === 'pending'}
                                                            >
                                                                Set Official
                                                            </CButton>
                                                        ) : (
                                                            <CButton color="secondary" size="sm" disabled>
                                                                Official
                                                            </CButton>
                                                        )}
                                                    </CTableDataCell>
                                                )}
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            </>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default ManageExams;