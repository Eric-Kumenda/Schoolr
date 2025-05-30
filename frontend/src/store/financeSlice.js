import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from '../utils/axios';

export const billCohort = createAsyncThunk(
    'finance/billCohort',
    async ({ cohortId, billingData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/finance/cohorts/${cohortId}/bill`, billingData);
            return response.data; // Expecting { message, billings }
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to bill cohort.');
        }
    }
);

export const billStudent = createAsyncThunk(
    'finance/billStudent',
    async ({ studentId, billingData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/finance/students/${studentId}/bill`, billingData);
            return response.data; // Expecting { message, billing }
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to bill student.');
        }
    }
);

export const getStudentBalance = createAsyncThunk(
    'finance/getStudentBalance',
    async (studentId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/finance/students/${studentId}/balance`);
            return response.data; // Expecting { studentId, admNo, accountBalance }
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch student balance.');
        }
    }
);

export const getStudentTransactions = createAsyncThunk(
    'finance/getStudentTransactions',
    async (studentId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/finance/students/${studentId}/transactions`);
            return response.data; // Expecting an array of transactions
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch student transactions.');
        }
    }
);

export const recordPayment = createAsyncThunk(
    'finance/recordPayment',
    async (paymentData, { rejectWithValue }) => {
        // paymentData will include: studentAdmNo, amount, transactionDate, paymentMethod, reference, description
        try {
            const response = await axios.post('/finance/record-payment', paymentData);
            return response.data; // Expecting { message, transaction, studentBalance }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to record payment.');
        }
    }
);

/*
export const initiateMpesaPayment = createAsyncThunk(
    'finance/initiateMpesaPayment',
    async ({ studentId, paymentData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/finance/students/${studentId}/pay/mpesa`, paymentData);
            return response.data; // Expecting MPesa initiation response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to initiate MPesa payment.');
        }
    }
);

export const createStripePaymentIntent = createAsyncThunk(
    'finance/createStripePaymentIntent',
    async ({ studentId, paymentData }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/finance/students/${studentId}/pay/stripe`, paymentData);
            return response.data; // Expecting { clientSecret }
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create Stripe Payment Intent.');
        }
    }
);

export const finalizeStripePayment = createAsyncThunk(
    'finance/finalizeStripePayment',
    async (paymentIntentId, { rejectWithValue }) => {
        try {
            const response = await axios.post('/finance/stripe/payment/success', { paymentIntentId });
            return response.data; // Expecting success message
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to finalize Stripe payment.');
        }
    }
);*/

const financeSlice = createSlice({
    name: 'finance',
    initialState: {
        billingLoading: 'idle',
        billingError: null,
        studentBalance: null,
        transactions: [],
        recordPaymentLoading: null,
        recordPaymentError: null,
    },
    reducers: {
        clearStudentFinanceData: (state) => {
            state.studentBalance = null;
            state.transactions = [];
        },
    },
    extraReducers: (builder) => {
        // Handle billCohort Thunk
        builder.addCase(billCohort.pending, (state) => {
            state.billingLoading = 'pending';
            state.billingError = null;
        });
        builder.addCase(billCohort.fulfilled, (state, action) => {
            state.billingLoading = 'succeeded';
            // Optionally update state with the created billings
        });
        builder.addCase(billCohort.rejected, (state, action) => {
            state.billingLoading = 'failed';
            state.billingError = action.payload;
        });

        // Handle billStudent Thunk (similarly)
        builder.addCase(billStudent.pending, (state) => { /* ... */ });
        builder.addCase(billStudent.fulfilled, (state, action) => { /* ... */ });
        builder.addCase(billStudent.rejected, (state, action) => { /* ... */ });

        // Handle getStudentBalance Thunk
        builder.addCase(getStudentBalance.pending, (state) => { /* ... */ });
        builder.addCase(getStudentBalance.fulfilled, (state, action) => {
            state.studentBalance = action.payload;
            state.billingLoading = 'succeeded';
            state.billingError = null;
        });
        builder.addCase(getStudentBalance.rejected, (state, action) => {
            state.billingLoading = 'failed';
            state.billingError = action.payload;
            state.studentBalance = null;
        });

        // Handle getStudentTransactions Thunk (similarly)
        builder.addCase(getStudentTransactions.pending, (state) => { /* ... */ });
        builder.addCase(getStudentTransactions.fulfilled, (state, action) => {
            state.transactions = action.payload;
            state.billingLoading = 'succeeded';
            state.billingError = null;
        });
        builder.addCase(getStudentTransactions.rejected, (state, action) => { /* ... */ });
        builder.addCase(recordPayment.pending, (state) => {
            state.recordPaymentLoading = 'pending';
            state.recordPaymentError = null;
        });
        builder.addCase(recordPayment.fulfilled, (state, action) => {
            state.recordPaymentLoading = 'succeeded';
            state.recordPaymentError = null;
            // You might want to update the student's balance in the store here
            // or refetch student data, depending on your state management strategy.
            // For now, we'll just show a success message.
            console.log('Payment recorded successfully:', action.payload);
            // Optionally, you could update a list of recent transactions or the student's balance
            // if you have it in your state and action.payload includes the updated studentBalance
        });
        builder.addCase(recordPayment.rejected, (state, action) => {
            state.recordPaymentLoading = 'failed';
            state.recordPaymentError = action.payload;
        })
        
    },
});

export const { clearStudentFinanceData } = financeSlice.actions;

export default financeSlice.reducer;