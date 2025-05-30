import React, { useEffect } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentBalance, getStudentTransactions, clearStudentFinanceData } from '../../store/financeSlice'; // Adjust path

const BalanceAndTransactions = ({ studentId }) => {
    const dispatch = useDispatch();
    const { studentBalance, transactions, billingLoading, billingError } = useSelector((state) => state.finance);
    /*const studentData = useSelector((state) => {
        // Find the student data based on studentId from your studentsData
        if (!studentId || !state.school.studentsData) return null;
        for (const cohort of state.school.studentsData) {
            const found = cohort.students.find(student => student._id === studentId);
            if (found) return found;
        }
        return null;
    });*/
    console.log(studentBalance)

    useEffect(() => {
        if (studentId) {
            dispatch(getStudentBalance(studentId));
            dispatch(getStudentTransactions(studentId));
        }

        return () => {
            dispatch(clearStudentFinanceData());
        };
    }, [dispatch, studentId]);

    if (!studentId) {
        return <p>Please select a student to view their balance and transactions.</p>;
    }

    if (billingLoading === 'pending') {
        return <p>Loading balance and transactions...</p>;
    }

    if (billingError) {
        return <p className="text-danger">Error loading data: {billingError}</p>;
    }

    return (
        <CRow>
            <CCol>
                <CCard>
                    <CCardHeader>
                        <strong>Account Balance</strong>
                    </CCardHeader>
                    <CCardBody>
                        {studentBalance ? (
                            <h3>Current Balance: Ksh {studentBalance.accountBalance.toLocaleString()}</h3>
                        ) : (
                            <p>Balance not available.</p>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
            <CCol xs={12}>
                <CCard className="mt-3">
                    <CCardHeader>
                        <strong>Transaction History</strong>
                    </CCardHeader>
                    <CCardBody>
                        {transactions && transactions.length > 0 ? (
                            <CTable striped bordered responsive>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Date</CTableHeaderCell>
                                        <CTableHeaderCell>Type</CTableHeaderCell>
                                        <CTableHeaderCell>Description</CTableHeaderCell>
                                        <CTableHeaderCell>Amount</CTableHeaderCell>
                                        <CTableHeaderCell>Payment Method</CTableHeaderCell>
                                        <CTableHeaderCell>Reference</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {transactions.map((transaction) => (
                                        <CTableRow key={transaction._id}>
                                            <CTableDataCell>{new Date(transaction.transactionDate).toLocaleDateString()}</CTableDataCell>
                                            <CTableDataCell>{transaction.transactionType}</CTableDataCell>
                                            <CTableDataCell>{transaction.description}</CTableDataCell>
                                            <CTableDataCell>{transaction.amount.toLocaleString()}</CTableDataCell>
                                            <CTableDataCell>{transaction.paymentMethod || '-'}</CTableDataCell>
                                            <CTableDataCell>{transaction.reference || '-'}</CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        ) : (
                            <p>No transaction history available for this student.</p>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default BalanceAndTransactions;