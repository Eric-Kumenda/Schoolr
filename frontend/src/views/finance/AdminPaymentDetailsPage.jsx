import React, { useEffect, useState } from 'react';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CSpinner,
    CAlert,
    CForm,
    CFormInput,
    CFormLabel,
    CButton,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getSchoolPaymentDetails,
    updateSchoolPaymentDetails,
    clearSchoolPaymentDetailsState,
} from '../../store/schoolSlice'; // Adjust path

const AdminPaymentDetailsPage = () => {
    const dispatch = useDispatch();
    const {
        schoolPaymentDetails,
        schoolPaymentDetailsLoading,
        schoolPaymentDetailsError,
    } = useSelector((state) => state.school);

    const [formData, setFormData] = useState({
        mpesaPaybillNumber: '',
        mpesaAccountNameFormat: '',
        bankName: '',
        bankAccountNumber: '',
        bankAccountName: '',
        // Add other payment detail fields as needed from your School model
    });

    const [updateStatus, setUpdateStatus] = useState({
        loading: false,
        success: false,
        error: null,
    });

    // Fetch existing payment details on component mount
    useEffect(() => {
        dispatch(getSchoolPaymentDetails());
        return () => {
            dispatch(clearSchoolPaymentDetailsState());
        };
    }, [dispatch]);

    // Populate form when schoolPaymentDetails are loaded
    useEffect(() => {
        if (schoolPaymentDetails && schoolPaymentDetailsLoading === 'succeeded') {
            setFormData({
                mpesaPaybillNumber: schoolPaymentDetails.mpesaPaybillNumber || '',
                mpesaAccountNameFormat: schoolPaymentDetails.mpesaAccountNameFormat || '',
                bankName: schoolPaymentDetails.bankName || '',
                bankAccountNumber: schoolPaymentDetails.bankAccountNumber || '',
                bankAccountName: schoolPaymentDetails.bankAccountName || '',
                // Ensure all fields are initialized to prevent uncontrolled to controlled input warnings
            });
        }
    }, [schoolPaymentDetails, schoolPaymentDetailsLoading]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateStatus({ loading: true, success: false, error: null });

        try {
            await dispatch(updateSchoolPaymentDetails({ paymentDetails: formData })).unwrap();
            setUpdateStatus({ loading: false, success: true, error: null });
            // Optionally refetch the details to ensure state is in sync if backend transformation occurs
            dispatch(getSchoolPaymentDetails());
        } catch (error) {
            setUpdateStatus({ loading: false, success: false, error: error || 'Failed to update payment details.' });
        }
    };

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Update School Payment Details</strong>
                    </CCardHeader>
                    <CCardBody>
                        {schoolPaymentDetailsLoading === 'pending' ? (
                            <div className="text-center"><CSpinner color="primary" /></div>
                        ) : schoolPaymentDetailsError ? (
                            <CAlert color="danger">Error loading payment details: {schoolPaymentDetailsError}</CAlert>
                        ) : (
                            <CForm onSubmit={handleSubmit}>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="mpesaPaybillNumber">MPesa Paybill Number</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="mpesaPaybillNumber"
                                            value={formData.mpesaPaybillNumber}
                                            onChange={handleChange}
                                            placeholder="e.g., 123456"
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="mpesaAccountNameFormat">MPesa Account Name Format</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="mpesaAccountNameFormat"
                                            value={formData.mpesaAccountNameFormat}
                                            onChange={handleChange}
                                            placeholder="e.g., STUDENTID or ADMISSIONNO"
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="bankName">Bank Name</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="bankName"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                            placeholder="e.g., Equity Bank"
                                        />
                                    </CCol>
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="bankAccountNumber">Bank Account Number</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="bankAccountNumber"
                                            value={formData.bankAccountNumber}
                                            onChange={handleChange}
                                            placeholder="e.g., 0123456789"
                                        />
                                    </CCol>
                                </CRow>
                                <CRow className="mb-3">
                                    <CCol md={6}>
                                        <CFormLabel htmlFor="bankAccountName">Bank Account Name</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            id="bankAccountName"
                                            value={formData.bankAccountName}
                                            onChange={handleChange}
                                            placeholder="e.g., School Name Ltd."
                                        />
                                    </CCol>
                                </CRow>
                                {/* Add more form fields for other payment details here */}

                                <div className="d-grid gap-2">
                                    <CButton type="submit" color="primary" disabled={updateStatus.loading}>
                                        {updateStatus.loading ? <CSpinner size="sm" /> : 'Update Payment Details'}
                                    </CButton>
                                </div>

                                {updateStatus.success && (
                                    <CAlert color="success" className="mt-3">
                                        Payment details updated successfully!
                                    </CAlert>
                                )}
                                {updateStatus.error && (
                                    <CAlert color="danger" className="mt-3">
                                        Error: {updateStatus.error}
                                    </CAlert>
                                )}
                            </CForm>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default AdminPaymentDetailsPage;