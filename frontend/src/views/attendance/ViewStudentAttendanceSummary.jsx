import React, { useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CListGroup,
    CListGroupItem,
    CAlert,
    CSpinner,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentAttendanceSummary, clearAttendanceState } from '../../store/schoolSlice'; // Adjust path
import { useParams } from 'react-router-dom';

const ViewStudentAttendanceSummary = () => {
    const { studentId } = useParams(); // Get student ID from URL
    const dispatch = useDispatch();
    const { studentAttendanceSummary, attendanceLoading, attendanceError } = useSelector((state) => state.school);

    useEffect(() => {
        if (studentId) {
            dispatch(getStudentAttendanceSummary(studentId));
        }
        return () => {
            dispatch(clearAttendanceState()); // Clean up state on unmount
        };
    }, [dispatch, studentId]);

    if (attendanceLoading === 'pending') {
        return <CSpinner />;
    }

    if (attendanceError) {
        return <CAlert color="danger">{attendanceError}</CAlert>;
    }

    if (!studentAttendanceSummary) {
        return <CAlert color="info">No attendance summary found for this student.</CAlert>;
    }

    const { name, adm_no, summary } = studentAttendanceSummary;
    const totalDaysRecorded = (summary?.totalDaysPresent || 0) + (summary?.totalDaysAbsent || 0) +
                             (summary?.totalDaysLate || 0) + (summary?.totalDaysExcused || 0);
    const attendancePercentage = totalDaysRecorded > 0
        ? ((summary?.totalDaysPresent || 0) / totalDaysRecorded * 100).toFixed(2)
        : '0.00';

    return (
        <CRow>
            <CCol md={8} lg={6}>
                <CCard>
                    <CCardHeader>
                        <strong>Attendance Summary for {name} ({adm_no})</strong>
                    </CCardHeader>
                    <CCardBody>
                        <CListGroup flush>
                            <CListGroupItem>
                                <strong>Total Days Recorded:</strong> {totalDaysRecorded}
                            </CListGroupItem>
                            <CListGroupItem>
                                <strong>Days Present:</strong> {summary?.totalDaysPresent || 0}
                            </CListGroupItem>
                            <CListGroupItem>
                                <strong>Days Absent:</strong> {summary?.totalDaysAbsent || 0}
                            </CListGroupItem>
                            <CListGroupItem>
                                <strong>Days Late:</strong> {summary?.totalDaysLate || 0}
                            </CListGroupItem>
                            <CListGroupItem>
                                <strong>Days Excused:</strong> {summary?.totalDaysExcused || 0}
                            </CListGroupItem>
                            <CListGroupItem>
                                <strong>Overall Present Percentage:</strong> {attendancePercentage}%
                            </CListGroupItem>
                            <CListGroupItem>
                                <strong>Last Updated:</strong> {summary?.lastAttendanceUpdate ? new Date(summary.lastAttendanceUpdate).toLocaleDateString() : 'N/A'}
                            </CListGroupItem>
                        </CListGroup>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default ViewStudentAttendanceSummary;