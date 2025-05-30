import React, { useEffect, useMemo } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CAlert,
    CSpinner,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getDailyAttendancePercentage, clearDailyAttendancePercentageState } from '../../store/schoolSlice'; // Adjust path

// Import Chart.js components for Line Chart
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DailyAttendanceChart = () => {
    const dispatch = useDispatch();
    const { dailyAttendancePercentage, dailyAttendancePercentageLoading, dailyAttendancePercentageError } = useSelector((state) => state.school);

    useEffect(() => {
        dispatch(getDailyAttendancePercentage());
        return () => {
            dispatch(clearDailyAttendancePercentageState()); // Clean up state on unmount
        };
    }, [dispatch]);

    // Prepare chart data using useMemo for optimization
    const chartData = useMemo(() => {
        if (!dailyAttendancePercentage || !dailyAttendancePercentage.dateLabels || !dailyAttendancePercentage.presentPercentages) {
            return { labels: [], datasets: [] };
        }

        const labels = dailyAttendancePercentage.dateLabels;
        const data = dailyAttendancePercentage.presentPercentages;

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Percentage of Students Present',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true, // Fill area under the line
                    tension: 0.3, // Smoothness of the line
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
                },
            ],
        };
    }, [dailyAttendancePercentage]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Daily Student Attendance: Last 12 Days',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y || 0;
                        return `${label}: ${value.toFixed(2)}%`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Present Percentage (%)',
                },
                max: 100,
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
        },
    };

    if (dailyAttendancePercentageLoading === 'pending') {
        return <CSpinner />;
    }

    if (dailyAttendancePercentageError) {
        return <CAlert color="danger">{dailyAttendancePercentageError}</CAlert>;
    }

    if (!dailyAttendancePercentage || chartData.labels.length === 0) {
        return <CAlert color="info">No attendance data available for the last 12 days.</CAlert>;
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Daily Student Attendance Overview</strong>
                    </CCardHeader>
                    <CCardBody>
                        <div style={{ height: '400px', width: '100%' }}> {/* Adjust dimensions as needed */}
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default DailyAttendanceChart;