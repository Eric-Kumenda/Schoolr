import React, { useEffect, useMemo } from 'react';
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

// Import Chart.js components for Pie Chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components for Pie Chart
ChartJS.register(ArcElement, Tooltip, Legend);


const ViewStudentAttendanceSummary = ({studentId}) => {
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

    const { name, adm_no, summary } = studentAttendanceSummary?studentAttendanceSummary:{name: "", adm_no: "", summary: ""};
    const totalDaysRecorded = (summary?.totalDaysPresent || 0) + (summary?.totalDaysAbsent || 0) +
                             (summary?.totalDaysLate || 0) + (summary?.totalDaysExcused || 0);
    const attendancePercentage = totalDaysRecorded > 0
        ? ((summary?.totalDaysPresent || 0) / totalDaysRecorded * 100).toFixed(2)
        : '0.00';

    // Prepare data for the Pie Chart using useMemo for efficiency
    const pieChartData = useMemo(() => {
        // We want Present vs. Absent specifically
        const present = summary?.totalDaysPresent || 0;
        const absent = summary?.totalDaysAbsent || 0;
        const late = summary?.totalDaysLate || 0;
        const excused = summary?.totalDaysExcused || 0;

        return {
            labels: ['Present', 'Absent', 'Late', 'Excused'],
            datasets: [
                {
                    data: [present, absent, late, excused],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)', // Present (Greenish-blue)
                        'rgba(255, 99, 132, 0.6)', // Absent (Red)
                        'rgba(255, 206, 86, 0.6)', // Late (Yellow)
                        'rgba(54, 162, 235, 0.6)', // Excused (Blue)
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [summary]); // Recalculate if summary changes

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false, // Allows flexible sizing
        plugins: {
            legend: {
                position: 'right', // Place legend on the right
            },
            title: {
                display: true,
                text: 'Attendance Distribution',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) + '%' : '0.00%';
                        return `${label}: ${value} days (${percentage})`;
                    }
                }
            }
        },
    };

    if (attendanceLoading === 'pending') {
        return <CSpinner className='text-center d-block' />;
    }

    if (attendanceError) {
        return <CAlert color="danger">{attendanceError}</CAlert>;
    }

    if (!studentAttendanceSummary || !studentAttendanceSummary.summary) {
        return <CAlert color="info">No attendance summary found for this student.</CAlert>;
    }


    return (
        <CRow className='my-2'>
            <CCol>
                <CCard className='shadow'>
                    <CCardHeader>
                        <strong>Attendance Summary for {name} ({adm_no})</strong>
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol md={6}> {/* Column for List */}
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
                            </CCol>
                            <CCol md={6}> {/* Column for Chart */}
                                {totalDaysRecorded > 0 ? (
                                    <div style={{ height: '300px', width: '100%' }}> {/* Adjust dimensions */}
                                        <Pie data={pieChartData} options={pieChartOptions} />
                                    </div>
                                ) : (
                                    <CAlert color="info" className="mt-3">No attendance data to display chart.</CAlert>
                                )}
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default ViewStudentAttendanceSummary;