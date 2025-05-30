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
import { getCohortExamPerformance, clearCohortExamPerformanceState } from '../../store/schoolSlice'; // Adjust path if needed

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

const CohortExamPerformanceChart = () => {
    const dispatch = useDispatch();
    const { cohortExamPerformance, cohortExamPerformanceLoading, cohortExamPerformanceError } = useSelector((state) => state.school);

    useEffect(() => {
        dispatch(getCohortExamPerformance());
        return () => {
            dispatch(clearCohortExamPerformanceState()); // Clean up state on unmount
        };
    }, [dispatch]);

    // Prepare chart data using useMemo for optimization
    const chartData = useMemo(() => {
        if (!cohortExamPerformance || !cohortExamPerformance.examLabels || !cohortExamPerformance.cohortData) {
            return { labels: [], datasets: [] };
        }

        const labels = cohortExamPerformance.examLabels;
        const datasets = Object.entries(cohortExamPerformance.cohortData).map(([cohortName, scores], index) => {
            // Generate distinct colors for each line
            const hue = (index * 137) % 360; // Use a prime number for good distribution
            const color = `hsl(${hue}, 70%, 50%)`; // HSL for vibrant colors

            return {
                label: `Cohort ${cohortName}`,
                data: scores,
                borderColor: color,
                backgroundColor: color,
                fill: false, // Don't fill area under the line
                tension: 0.2, // Smoothness of the line
            };
        });

        return {
            labels: labels,
            datasets: datasets,
        };
    }, [cohortExamPerformance]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Average Exam Performance by Cohort Over Exams',
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
                    text: 'Average Score (%)',
                },
                max: 100, // Assuming scores are out of 100
            },
            x: {
                title: {
                    display: true,
                    text: 'Exam',
                },
            },
        },
    };

    if (cohortExamPerformanceLoading === 'pending') {
        return <CSpinner />;
    }

    if (cohortExamPerformanceError) {
        return <CAlert color="danger">{cohortExamPerformanceError}</CAlert>;
    }

    if (!cohortExamPerformance || chartData.labels.length === 0) {
        return <CAlert color="info">No exam performance data available for cohorts.</CAlert>;
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Cohort Exam Performance Trend</strong>
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

export default CohortExamPerformanceChart;