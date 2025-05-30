import React, { useEffect } from "react";
import {
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CRow,
	CSpinner,
	CAlert,
	CTable,
	CTableHead,
	CTableRow,
	CTableHeaderCell,
	CTableBody,
	CTableDataCell,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import {
	getStudentFinanceDetails,
	getSchoolPaymentDetails,
	clearStudentFinanceDetailsState,
	clearSchoolPaymentDetailsState,
} from "../../store/schoolSlice"; // Adjust path

const StudentFinance = ({ studentId }) => {
	const dispatch = useDispatch();
	const {
		studentFinanceDetails,
		studentFinanceDetailsLoading,
		studentFinanceDetailsError,
		schoolPaymentDetails,
		schoolPaymentDetailsLoading,
		schoolPaymentDetailsError,
	} = useSelector((state) => state.school);

	useEffect(() => {
		dispatch(getStudentFinanceDetails(studentId));
		dispatch(getSchoolPaymentDetails());
		return () => {
			dispatch(clearStudentFinanceDetailsState());
			dispatch(clearSchoolPaymentDetailsState());
		};
	}, [dispatch, studentId]);

	return (
		<CRow>
			<CCol xs={12} md={6}>
				<CCard className="mb-4">
					<CCardHeader>
						<strong>Your Fee Balance</strong>
					</CCardHeader>
					<CCardBody className="text-center">
						{studentFinanceDetailsLoading === "pending" ? (
							<CSpinner color="primary" />
						) : studentFinanceDetailsError ? (
							<CAlert color="danger">
								{studentFinanceDetailsError}
							</CAlert>
						) : (
							<h1 className="display-4 text-success">
								Ksh{" "}
								{studentFinanceDetails.accountBalance.toFixed(
									2
								)}
							</h1>
						)}
					</CCardBody>
				</CCard>
			</CCol>

			<CCol xs={12} md={6}>
				<CCard className="mb-4">
					<CCardHeader>
						<strong>Your Transactions</strong>
					</CCardHeader>
					<CCardBody>
						{studentFinanceDetailsLoading === "pending" ? (
							<div className="text-center">
								<CSpinner color="primary" />
							</div>
						) : studentFinanceDetailsError ? (
							<CAlert color="danger">
								{studentFinanceDetailsError}
							</CAlert>
						) : studentFinanceDetails.transactions.length === 0 ? (
							<CAlert color="info">No transactions found.</CAlert>
						) : (
							<CTable bordered hover responsive>
								<CTableHead>
									<CTableRow>
										<CTableHeaderCell scope="col">
											Date
										</CTableHeaderCell>
										<CTableHeaderCell scope="col">
											Description
										</CTableHeaderCell>
										<CTableHeaderCell scope="col">
											Amount
										</CTableHeaderCell>
										<CTableHeaderCell scope="col">
											Type
										</CTableHeaderCell>
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{studentFinanceDetails.transactions.map(
										(transaction) => (
											<CTableRow key={transaction._id}>
												<CTableDataCell>
													{new Date(
														transaction.transactionDate
													).toLocaleDateString()}
												</CTableDataCell>
												<CTableDataCell>
													{transaction.description}
												</CTableDataCell>
												<CTableDataCell
													className={
														transaction.transactionType ===
														"PAYMENT"
															? "text-success"
															: "text-danger"
													}>
													{transaction.transactionType ===
													"PAYMENT"
														? "-"
														: "+"}{" "}
													Ksh{" "}
													{transaction.transactionType ===
													"PAYMENT"
														? (
																transaction.amount *
																-1
														  ).toFixed(2)
														: transaction.amount.toFixed(
																2
														  )}
												</CTableDataCell>
												<CTableDataCell>
													{
														transaction.transactionType
													}
												</CTableDataCell>
											</CTableRow>
										)
									)}
								</CTableBody>
							</CTable>
						)}
					</CCardBody>
				</CCard>
			</CCol>

			<CCol xs={12}>
				<CCard className="mb-4">
					<CCardHeader>
						<strong>School Payment Details</strong>
					</CCardHeader>
					<CCardBody>
						{schoolPaymentDetailsLoading === "pending" ? (
							<div className="text-center">
								<CSpinner color="primary" />
							</div>
						) : schoolPaymentDetailsError ? (
							<CAlert color="danger">
								{schoolPaymentDetailsError}
							</CAlert>
						) : (
							<>
								<p>
									<strong>MPesa Paybill Number:</strong>{" "}
									{schoolPaymentDetails.mpesaPaybillNumber ||
										"N/A"}
								</p>
								<p>
									<strong>MPesa Account Name Format:</strong>{" "}
									{schoolPaymentDetails.mpesaAccountNameFormat ||
										"N/A"}
								</p>
								<p>
									<strong>Bank Name:</strong>{" "}
									{schoolPaymentDetails.bankName || "N/A"}
								</p>
								<p>
									<strong>Bank Account Number:</strong>{" "}
									{schoolPaymentDetails.bankAccountNumber ||
										"N/A"}
								</p>
								<p>
									<strong>Bank Account Name:</strong>{" "}
									{schoolPaymentDetails.bankAccountName ||
										"N/A"}
								</p>
								{/* Add more payment details as needed */}
							</>
						)}
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
	);
};

export default StudentFinance;
