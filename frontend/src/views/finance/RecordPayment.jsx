import React, { useState, useEffect } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CRow,
    CAlert,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { recordPayment } from '../../store/financeSlice';

const RecordPayment = () => {
    const dispatch = useDispatch();
    const { billingLoading, billingError } = useSelector((state) => state.finance);
    const {schoolId, userId, role} = useSelector((state) => state.auth)

    const [studentAdmNo, setStudentAdmNo] = useState('');
    const [amount, setAmount] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [paymentMethod, setPaymentMethod] = useState('MPesa');
    const [reference, setReference] = useState('');
    const [description, setDescription] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleRecordPayment = async () => {
        setSuccessMessage(''); // Clear previous messages
        if (!studentAdmNo || !amount || parseFloat(amount) <= 0 || !paymentMethod) {
            alert('Please fill in all required fields: Student Admission No, Amount, and Payment Method.');
            return;
        }

        const paymentData = {
            studentAdmNo,
            amount: parseFloat(amount),
            transactionDate,
            paymentMethod,
            reference,
            description,
            schoolId,
            userId,
            role
        };

        const resultAction = await dispatch(recordPayment(paymentData));

        if (recordPayment.fulfilled.match(resultAction)) {
            setSuccessMessage(resultAction.payload.message);
            // Clear form after successful submission
            setStudentAdmNo('');
            setAmount('');
            setReference('');
            setDescription('');
            setPaymentMethod('MPesa');
            setTransactionDate(new Date().toISOString().split('T')[0]); // Reset date to today
        } else if (recordPayment.rejected.match(resultAction)) {
            // Error message will be handled by billingError from Redux store
        }
    };

    return (
        <CRow className='justify-content-center'>
            <CCol md={10} lg={8}>
                <CCard>
                    <CCardHeader>
                        <strong>Record Student Payment</strong>
                    </CCardHeader>
                    <CCardBody>
                        {successMessage && <CAlert color="success">{successMessage}</CAlert>}
                        {billingError && <CAlert color="danger">{billingError}</CAlert>}

                        <CForm>
                            <CRow className="mb-3">
                                <CCol xs={12}>
                                    <CFormInput
                                        type="text"
                                        label="Student Admission Number"
                                        placeholder="e.g., ADM/001/2024"
                                        value={studentAdmNo}
                                        onChange={(e) => setStudentAdmNo(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="mb-3">
                                <CCol xs={6}>
                                    <CFormInput
                                        type="number"
                                        label="Amount Paid (Ksh)"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                    />
                                </CCol>
                                <CCol xs={6}>
                                    <CFormInput
                                        type="date"
                                        label="Date of Payment"
                                        value={transactionDate}
                                        onChange={(e) => setTransactionDate(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="mb-3">
                                <CCol xs={12}>
                                    <CFormSelect
                                        label="Payment Method"
                                        options={[
                                            { label: 'Select Method', value: '', disabled: true },
                                            { label: 'MPesa', value: 'MPesa' },
                                            { label: 'Bank Transfer', value: 'Bank Transfer' },
                                            { label: 'Cash', value: 'Cash' },
                                            { label: 'Cheque', value: 'Cheque' },
                                            // Add other methods as needed
                                        ]}
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="mb-3">
                                <CCol xs={12}>
                                    <CFormInput
                                        type="text"
                                        label="Transaction Reference (e.g., MPesa TXN ID, Bank Slip No.)"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="mb-3">
                                <CCol xs={12}>
                                    <CFormTextarea
                                        label="Description (Optional)"
                                        rows="3"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    ></CFormTextarea>
                                </CCol>
                            </CRow>

                            <CButton
                                color="primary"
                                onClick={handleRecordPayment}
                                disabled={billingLoading === 'pending'}
                                className="mt-3"
                            >
                                {billingLoading === 'pending' ? 'Recording...' : 'Record Payment'}
                            </CButton>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default RecordPayment;