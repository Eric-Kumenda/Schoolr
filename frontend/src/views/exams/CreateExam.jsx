import React, { useState } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormSelect,
    CRow,
    CAlert,
} from '@coreui/react';
import { useDispatch, useSelector } from 'react-redux';
import { createExam } from '../../store/schoolSlice'; // Adjust path

const CreateExam = () => {
    const dispatch = useDispatch();
    const { examsLoading, examsError } = useSelector((state) => state.school);

    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
    const [term, setTerm] = useState('');
    const [examDate, setExamDate] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleCreateExam = async () => {
        setSuccessMessage('');
        if (!examName || !academicYear || !term) {
            alert('Please fill in all required fields: Exam Name, Academic Year, and Term.');
            return;
        }

        const newExamData = {
            examName,
            academicYear: parseInt(academicYear, 10),
            term,
            examDate: examDate || undefined, // Send as undefined if not provided
        };

        const resultAction = await dispatch(createExam(newExamData));

        if (createExam.fulfilled.match(resultAction)) {
            setSuccessMessage(resultAction.payload.message);
            // Clear form
            setExamName('');
            setAcademicYear(new Date().getFullYear().toString());
            setTerm('');
            setExamDate('');
        }
        // Error handled by examsError in Redux state
    };

    return (
        <CRow className='justify-content-center'>
            <CCol md={10} lg={8}>
                <CCard>
                    <CCardHeader>
                        <strong>Create New Exam</strong>
                    </CCardHeader>
                    <CCardBody>
                        {successMessage && <CAlert color="success">{successMessage}</CAlert>}
                        {examsError && <CAlert color="danger">{examsError}</CAlert>}

                        <CForm>
                            <CRow className="mb-3">
                                <CCol xs={12}>
                                    <CFormInput
                                        type="text"
                                        label="Exam Name"
                                        placeholder="e.g., Term 1 Exams"
                                        value={examName}
                                        onChange={(e) => setExamName(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="mb-3">
                                <CCol xs={6}>
                                    <CFormInput
                                        type="number"
                                        label="Academic Year"
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        required
                                    />
                                </CCol>
                                <CCol xs={6}>
                                    <CFormSelect
                                        label="Term"
                                        options={[
                                            { label: 'Select Term', value: '', disabled: true },
                                            { label: 'Term 1', value: 'Term 1' },
                                            { label: 'Term 2', value: 'Term 2' },
                                            { label: 'Term 3', value: 'Term 3' },
                                        ]}
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        required
                                    />
                                </CCol>
                            </CRow>

                            <CRow className="mb-3">
                                <CCol xs={12}>
                                    <CFormInput
                                        type="date"
                                        label="Exam Date (Optional)"
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                    />
                                </CCol>
                            </CRow>

                            <CButton
                                color="primary"
                                onClick={handleCreateExam}
                                disabled={examsLoading === 'pending'}
                                className="mt-3"
                            >
                                {examsLoading === 'pending' ? 'Creating...' : 'Create Exam'}
                            </CButton>
                        </CForm>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
};

export default CreateExam;