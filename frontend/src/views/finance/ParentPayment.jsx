import React, { useState, useEffect } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CRow,
    CFormSelect,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { initiateMpesaPayment, createStripePaymentIntent } from '../../store/schoolSlice'; // Adjust path

const ParentPayment = () => {
    const dispatch = useDispatch();
    const parentStudents = useSelector((state) => {
        // Assuming you have a way to get the parent's linked students in the store
        // This is placeholder logic - adjust based on your actual state structure
        const userId = state.auth.user?.id;
        const allStudentsData = state.school.studentsData;
        if (!userId || !allStudentsData) return [];
        return allStudentsData.reduce((acc, cohort) => [
            ...acc,
            ...cohort.students.filter(student => student.parentIds?.includes(userId)),
        ], []);
    });
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('mpesa');
    const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState('');
    const [stripeAmount, setStripeAmount] = useState('');
    const [stripeCurrency, setStripeCurrency] = useState('usd');
    const { mpesaInitiationResponse, stripeClientSecret, billingLoading, billingError } = useSelector((state) => state.school);

    useEffect(() => {
        // Handle Stripe client secret if it's returned
        if (stripeClientSecret) {
            alert(`Stripe Payment Intent Created. Client Secret: ${stripeClientSecret} (You'd integrate with Stripe.js here)`);
            dispatch({ type: 'school/clearStripeClientSecret' }); // Clear state
        }
    }, [stripeClientSecret, dispatch]);

    useEffect(() => {
        if (mpesaInitiationResponse) {
            alert(`MPesa Response: ${JSON.stringify(mpesaInitiationResponse)} (Check your phone for the STK Push)`);
            dispatch({ type: 'school/clearMpesaInitiationResponse' }); // Clear state
        }
    }, [mpesaInitiationResponse, dispatch]);

    const studentOptions = parentStudents.map(student => ({ value: student._id, label: `${student.first_name} ${student.surname} (${student.adm_no})` }));

    const handleMpesaPayment = () => {
        if (selectedStudentId && mpesaPhoneNumber) {
            dispatch(initiateMpesaPayment({ studentId: selectedStudentId, paymentData: { phoneNumber: mpesaPhoneNumber, amount: 1000 } })); // Example amount
        } else {
            alert('Please select a student and enter your MPesa phone number.');
        }
    };

    const handleStripePaymentIntent = () => {
        if (selectedStudentId && stripeAmount && stripeCurrency) {
            dispatch(createStripePaymentIntent({ studentId: selectedStudentId, paymentData: { amount: parseFloat(stripeAmount) * 100, currency: stripeCurrency } })); // Amount in cents
        } else {
            alert('Please select a student, enter the amount, and currency for Stripe.');
        }
    };

    return (
        <CRow>
            <CCol md={6}>
                <CCard>
                    <CCardHeader>
                        <strong>Make Payment</strong>
                    </CCardHeader>
                    <CCardBody>
                        <CForm>
                            <CRow className="mb-3">
                                <CCol md={12}>
                                    <CFormSelect
                                        label="Select Student"
                                        options={[{ value: '', label: 'Select Student' }, ...studentOptions]}
                                        value={selectedStudentId}
                                        onChange={(e) => setSelectedStudentId(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            {selectedStudentId && (
                                <>
                                    <CRow className="mb-3">
                                        <CCol md={12}>
                                            <CFormSelect
                                                label="Payment Method"
                                                options={[
                                                    { value: 'mpesa', label: 'MPesa' },
                                                    { value: 'stripe', label: 'Stripe (Credit/Debit Card)' },
                                                ]}
                                                value={paymentMethod}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                        </CCol>
                                    </CRow>

                                    {paymentMethod === 'mpesa' && (
                                        <CRow className="mb-3">
                                            <CCol md={12}>
                                                <CFormInput
                                                    type="tel"
                                                    label="MPesa Phone Number (e.g., 2547XXXXXXXX)"
                                                    value={mpesaPhoneNumber}
                                                    onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                                                    required
                                                />
                                            </CCol>
                                            <CCol md={12}>
                                                <CButton color="primary" onClick={handleMpesaPayment} disabled={billingLoading === 'pending'}>
                                                    {billingLoading === 'pending' ? 'Initiating MPesa...' : 'Pay with MPesa'}
                                                </CButton>
                                            </CCol>
                                        </CRow>
                                    )}

                                    {paymentMethod === 'stripe' && (
                                        <>
                                            <CRow className="mb-3">
                                                <CCol md={6}>
                                                    <CFormInput
                                                        type="number"
                                                        label="Amount"
                                                        value={stripeAmount}
                                                        onChange={(e) => setStripeAmount(e.target.value)}
                                                        required
                                                    />
                                                </CCol>
                                                <CCol md={6}>
                                                    <CFormSelect
                                                        label="Currency"
                                                        options={[
                                                            { value: 'usd', label: 'USD' },
                                                            // Add more currencies as needed
                                                        ]}
                                                        value={stripeCurrency}
                                                        onChange={(e) => setStripeCurrency(e.target.value)}
                                                        required
                                                    />
                                                </CCol>
                                            </CRow>
                                            <CCol md={12}>
                                                <CButton color="primary" onClick={handleStripePaymentIntent} disabled={billingLoading === 'pending'}>
                                                    {billingLoading === 'pending' ? 'Preparing Stripe Payment...' : 'Pay with Card'}
                                                </CButton>
                                                <p className="mt-2 text-muted">You will be redirected to Stripe to complete your payment securely.</p>
                                            </CCol>
                                        </>
                                    )}
                                </>
                            )}
                            {billingError && <p className="text-danger mt-2">{billingError}</p>}
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default ParentPayment;