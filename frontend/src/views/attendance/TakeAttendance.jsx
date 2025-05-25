import React, { useState, useEffect, useMemo } from 'react';
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
    CFormInput,
    CFormSelect,
    CAlert,
    CSpinner,
    CFormCheck,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentsForAttendance, recordBatchAttendance, clearAttendanceState } from '../../store/schoolSlice'; // Adjust path to your slice

const TakeAttendance = () => {
    const dispatch = useDispatch();
    const { studentsForAttendance, attendanceLoading, attendanceError } = useSelector((state) => state.school);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [selectedCohort, setSelectedCohort] = useState('');
    const [selectedStream, setSelectedStream] = useState('');
    const [attendanceStatus, setAttendanceStatus] = useState({}); // { studentId: 'Present'/'Absent'/'Late'/'Excused' }
    const [remarks, setRemarks] = useState({}); // { studentId: 'remark' }
    const [successMessage, setSuccessMessage] = useState('');

    // Derive unique cohorts and streams from the loaded studentsForAttendance
    const uniqueCohorts = useMemo(() => {
        const cohortsSet = new Set(studentsForAttendance.map(s => s.cohort));
        return Array.from(cohortsSet).sort();
    }, [studentsForAttendance]);

    const uniqueStreams = useMemo(() => {
        const streamsSet = new Set(studentsForAttendance.map(s => s.stream));
        return Array.from(streamsSet).sort();
    }, [studentsForAttendance]);

    useEffect(() => {
        // Fetch students when filters or date change
        // Only fetch if date is selected, and either both cohort/stream are selected, or none are (to get all students)
        if (selectedDate) {
            dispatch(getStudentsForAttendance({
                attendanceDate: selectedDate,
                cohort: selectedCohort || undefined, // Send undefined if not selected
                stream: selectedStream || undefined, // Send undefined if not selected
            }));
        }
        return () => {
            dispatch(clearAttendanceState()); // Clean up state on unmount
        };
    }, [dispatch, selectedDate, selectedCohort, selectedStream]);

    // Initialize attendanceStatus and remarks when studentsForAttendance data loads
    useEffect(() => {
        const initialStatus = {};
        const initialRemarks = {};
        studentsForAttendance.forEach(student => {
            initialStatus[student._id] = student.attendance.status || 'Present';
            initialRemarks[student._id] = student.attendance.remarks || '';
        });
        setAttendanceStatus(initialStatus);
        setRemarks(initialRemarks);
    }, [studentsForAttendance]);

    const handleStatusChange = (studentId, status) => {
        setAttendanceStatus(prev => ({ ...prev, [studentId]: status }));
    };

    const handleRemarksChange = (studentId, value) => {
        setRemarks(prev => ({ ...prev, [studentId]: value }));
    };

    const handleInvertSelection = () => {
        setAttendanceStatus(prevStatus => {
            const newStatus = { ...prevStatus };
            studentsForAttendance.forEach(student => {
                newStatus[student._id] = newStatus[student._id] === 'Present' ? 'Absent' : 'Present';
            });
            return newStatus;
        });
    };

    const handleSubmitAttendance = async () => {
        setSuccessMessage('');
        if (!selectedDate || !selectedCohort || !selectedStream) {
            // Added explicit check here because the API requires them for initial fetching
            alert('Please select a Date, Cohort, and Stream before submitting.');
            return;
        }

        const attendanceData = studentsForAttendance.map(student => ({
            studentId: student._id,
            status: attendanceStatus[student._id] || 'Present', // Default to Present if not explicitly set
            remarks: remarks[student._id] || '',
        }));

        const resultAction = await dispatch(recordBatchAttendance({
            attendanceDate: selectedDate,
            attendanceData,
        }));

        if (recordBatchAttendance.fulfilled.match(resultAction)) {
            setSuccessMessage(resultAction.payload.message);
            // Re-fetch students to show updated status after successful save
            // This ensures any backend calculations (like total present days) are reflected
            dispatch(getStudentsForAttendance({
                attendanceDate: selectedDate,
                cohort: selectedCohort,
                stream: selectedStream,
            }));
        }
        // Error handled by attendanceError in Redux state
    };

    // Memoized options for filters
    const cohortOptions = useMemo(() => ([
        { label: 'Select Cohort', value: '' }, // Allow 'All Cohorts'
        ...uniqueCohorts.map(c => ({ label: c, value: c })),
    ]), [uniqueCohorts]);

    const streamOptions = useMemo(() => ([
        { label: 'Select Stream', value: '' }, // Allow 'All Streams'
        ...uniqueStreams.map(s => ({ label: s, value: s })),
    ]), [uniqueStreams]);

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Take Daily Attendance</strong>
                    </CCardHeader>
                    <CCardBody>
                        {successMessage && <CAlert color="success">{successMessage}</CAlert>}
                        {attendanceError && <CAlert color="danger">{attendanceError}</CAlert>}

                        <CRow className="mb-3 align-items-end">
                            <CCol md={4}>
                                <CFormInput
                                    type="date"
                                    label="Attendance Date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    required
                                />
                            </CCol>
                            <CCol md={4}>
                                <CFormSelect
                                    label="Select Cohort"
                                    options={cohortOptions}
                                    value={selectedCohort}
                                    onChange={(e) => setSelectedCohort(e.target.value)}
                                    // Removed 'required' here to allow fetching all students for a date if desired
                                />
                            </CCol>
                            <CCol md={4}>
                                <CFormSelect
                                    label="Select Stream"
                                    options={streamOptions}
                                    value={selectedStream}
                                    onChange={(e) => setSelectedStream(e.target.value)}
                                    // Removed 'required' here
                                />
                            </CCol>
                        </CRow>

                        {attendanceLoading === 'pending' ? (
                            <CSpinner />
                        ) : studentsForAttendance.length === 0 ? (
                            <CAlert color="info">
                                Select a date, cohort, and stream to load students for attendance.
                                Or no students found for the selected criteria.
                            </CAlert>
                        ) : (
                            <>
                                <div className="d-flex justify-content-end mb-3">
                                    <CButton color="info" onClick={handleInvertSelection}>
                                        <i className="cil-sync me-1"></i> Invert Selection
                                    </CButton>
                                </div>

                                <CTable responsive striped hover className="mt-3">
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Present?</CTableHeaderCell>
                                            <CTableHeaderCell>Adm No</CTableHeaderCell>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Remarks</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {studentsForAttendance.map((student) => (
                                            <CTableRow key={student._id}>
                                                <CTableDataCell className="align-middle">
                                                    <CFormCheck
                                                        id={`checkbox-${student._id}`}
                                                        checked={attendanceStatus[student._id] === 'Present'}
                                                        onChange={(e) => handleStatusChange(
                                                            student._id,
                                                            e.target.checked ? 'Present' : 'Absent'
                                                        )}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>{student.adm_no}</CTableDataCell>
                                                <CTableDataCell>{`${student.first_name} ${student.surname}`}</CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormSelect
                                                        value={attendanceStatus[student._id] || 'Present'}
                                                        onChange={(e) => handleStatusChange(student._id, e.target.value)}
                                                        size="sm"
                                                        options={[
                                                            { label: 'Present', value: 'Present' },
                                                            { label: 'Absent', value: 'Absent' },
                                                            { label: 'Late', value: 'Late' },
                                                            { label: 'Excused', value: 'Excused' },
                                                        ]}
                                                    />
                                                </CTableDataCell>
                                                <CTableDataCell>
                                                    <CFormInput
                                                        type="text"
                                                        value={remarks[student._id] || ''}
                                                        onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                                                        placeholder="Remarks (e.g., Sick, Travel)"
                                                        size="sm"
                                                    />
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                                <CButton
                                    color="primary"
                                    onClick={handleSubmitAttendance}
                                    disabled={attendanceLoading === 'pending' || studentsForAttendance.length === 0}
                                    className="mt-3"
                                >
                                    {attendanceLoading === 'pending' ? 'Saving...' : 'Save Attendance'}
                                </CButton>
                            </>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default TakeAttendance;