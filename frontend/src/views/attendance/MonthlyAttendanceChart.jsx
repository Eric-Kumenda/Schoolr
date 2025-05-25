import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CAlert,
    CSpinner,
    CFormSelect,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getMonthlyAttendanceSummary, clearAttendanceState } from '../../store/schoolSlice'; // Adjust path
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MonthlyAttendanceChart = () => {
    const dispatch = useDispatch();
    const { monthlyAttendanceSummary, attendanceLoading, attendanceError } = useSelector((state) => state.school);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // getMonth() is 0-indexed

    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

    useEffect(() => {
        dispatch(getMonthlyAttendanceSummary({
            year: parseInt(selectedYear, 10),
            month: parseInt(selectedMonth, 10),
        }));
        return () => {
            dispatch(clearAttendanceState()); // Clean up on unmount
        };
    }, [dispatch, selectedYear, selectedMonth]);

    const chartData = useMemo(() => {
        const labels = monthlyAttendanceSummary.map(d => `Day ${d.day}`);
        const presentData = monthlyAttendanceSummary.map(d => d.Present);
        const absentData = monthlyAttendanceSummary.map(d => d.Absent);
        const lateData = monthlyAttendanceSummary.map(d => d.Late);
        const excusedData = monthlyAttendanceSummary.map(d => d.Excused);

        return {
            labels,
            datasets: [
                {
                    label: 'Present',
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    data: presentData,
                },
                {
                    label: 'Absent',
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    data: absentData,
                },
                {
                    label: 'Late',
                    backgroundColor: 'rgba(255, 206, 86, 0.6)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    data: lateData,
                },
                 {
                    label: 'Excused',
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    data: excusedData,
                },
            ],
        };
    }, [monthlyAttendanceSummary]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Daily Attendance for ${new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
            },
        },
        scales: {
            x: {
                stacked: true, // Stack bars for total students per day
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Students',
                },
            },
        },
    };

    const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString()); // Last 5 years
    const months = Array.from({ length: 12 }, (_, i) => ({
        label: new Date(0, i).toLocaleString('en-US', { month: 'long' }),
        value: (i + 1).toString(),
    }));

    return (
        <CRow>
            <CCol xs={12}>
                <CCard>
                    <CCardHeader>
                        <strong>Monthly Attendance Overview</strong>
                    </CCardHeader>
                    <CCardBody>
                        {attendanceError && <CAlert color="danger">{attendanceError}</CAlert>}

                        <CRow className="mb-3">
                            <CCol md={4}>
                                <CFormSelect
                                    label="Select Year"
                                    options={years.map(y => ({ label: y, value: y }))}
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                />
                            </CCol>
                            <CCol md={4}>
                                <CFormSelect
                                    label="Select Month"
                                    options={months}
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </CCol>
                        </CRow>

                        {attendanceLoading === 'pending' ? (
                            <CSpinner />
                        ) : monthlyAttendanceSummary.length === 0 && !attendanceError ? (
                            <CAlert color="info">No attendance data available for the selected month and year.</CAlert>
                        ) : (
                            <div style={{ height: '400px' }}> {/* Adjust height as needed */}
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default MonthlyAttendanceChart;