import React, { useState, useCallback } from "react";
import {
	CCard,
	CCardBody,
	CCardHeader,
	CCol,
	CForm,
	CFormLabel,
	CRow,
	CButton,
	CTable,
	CTableHead,
	CTableRow,
	CTableHeaderCell,
	CTableBody,
	CTableDataCell,
	CFormSelect,
	CFormInput,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { useEffect } from "react";
import { uploadStudentData } from "../../../store/schoolSlice";
import { addToast } from "../../../store/toastSlice";

const UploadStudents = () => {
	const [file, setFile] = useState(null);
	const [cohort, setCohort] = useState("");
	const [spreadsheetData, setSpreadsheetData] = useState(null);
	const [selectedSheet, setSelectedSheet] = useState(null);
	const [fieldMappings, setFieldMappings] = useState({});
	const [startPage, setStartPage] = useState(1);
	const [pageCount, setPageCount] = useState(5);
	const schoolId = useSelector((state) => state.auth.schoolId);
	const dispatch = useDispatch();

	const handleFileChange = (e) => {
		const selectedFile = e.target.files[0];
		setFile(selectedFile);
		setSpreadsheetData(null);
		setSelectedSheet(null);
		setFieldMappings({});

		if (selectedFile) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const workbook = XLSX.read(event.target.result, {
					type: "binary",
				});
				setSpreadsheetData(workbook);
			};
			reader.readAsBinaryString(selectedFile);
		}
	};

	const handleSheetChange = (e) => {
		const sheetName = e.target.value;
		setSelectedSheet(sheetName);
		// Initialize field mappings based on the new sheet's headers
		if (spreadsheetData && spreadsheetData.Sheets[sheetName]) {
			const headers =
				XLSX.utils.sheet_to_json(spreadsheetData.Sheets[sheetName], {
					header: 1,
				})[0] || [];
			const initialMappings = {};
			headers.forEach((header) => {
				initialMappings[header] = ""; // Initially no mapping
			});
			setFieldMappings(initialMappings);
		}
	};

	const handleFieldMappingChange = (header, selectedField) => {
		setFieldMappings((prevMappings) => ({
			...prevMappings,
			[header]: selectedField,
		}));
	};

	const handleCohortChange = (e) => {
		setCohort(e.target.value);
	};

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();

			if (!file || !selectedSheet) {
				alert("Please select a file and a sheet.");
				return;
			}

			if (!cohort) {
				alert("Please enter the cohort for this upload.");
				return;
			}

			const jsonData = XLSX.utils.sheet_to_json(
				spreadsheetData.Sheets[selectedSheet]
			);
			const uploadData = jsonData.map((row) => {
				const mappedRow = {};
				for (const header in fieldMappings) {
					if (fieldMappings[header]) {
						mappedRow[fieldMappings[header]] = row[header];
					}
				}
				return mappedRow;
			});

			try {
				const res = await dispatch(
					uploadStudentData({
						students: uploadData,
						schoolId: schoolId,
						cohort: cohort,
					})
				);
				if (res?.payload?.message) {
					dispatch(
						addToast({
							id: Date.now(),
							message: res.payload.message,
							title: "Success",
							color: "#28a745",
							timestamp: Date.now(),
						})
					);
					// Navigate to student list page
				} else if (res?.error) {
					dispatch(
						addToast({
							id: Date.now(),
							message: res.error,
							title: "Error",
							color: "#e55353",
							timestamp: Date.now(),
						})
					);
				}
			} catch (err) {
				dispatch(
					addToast({
						id: Date.now(),
						message: error,
						title: "Error",
						color: "#e55353",
						timestamp: Date.now(),
					})
				);
			}
		},
		[file, selectedSheet, cohort, fieldMappings, schoolId, dispatch]
	);

	const sheetNames = spreadsheetData?.SheetNames || [];
	const headers =
		selectedSheet && spreadsheetData?.Sheets[selectedSheet]
			? XLSX.utils.sheet_to_json(spreadsheetData.Sheets[selectedSheet], {
					header: 1,
			  })[0] || []
			: [];

	const sampleData =
		selectedSheet && spreadsheetData?.Sheets[selectedSheet]
			? XLSX.utils.sheet_to_json(spreadsheetData.Sheets[selectedSheet])
			: [];
	const [sampleDataDisplay, setSampleDataDisplay] = useState();
	useEffect(() => {
		selectedSheet &&
			sampleData &&
			setSampleDataDisplay(
				sampleData.slice(startPage - 1, startPage + pageCount - 1)
			);
	}, [startPage, pageCount, selectedSheet]);

	const databaseFields = [
		"adm_no",
		"first_name",
		"middle_name",
		"surname",
		"birth_cert_no",
		"DOB",
		"kcpe_index_no",
		"kcpe_year",
		"current_study_year",
		"stream",
		"cohort",
		"house",
		"dorm",
		"cube",
		"nemis_no",
		"nhif_no",
		"subjects",
	];

	return (
		<CRow className="d-flex justify-content-center mb-4">
			<CCol xs={12} md={10}>
				<CCard className="mb-4">
					<CCardHeader>
						<strong>Upload Student Data (Spreadsheet)</strong>
					</CCardHeader>
					<CCardBody>
						<CForm onSubmit={handleSubmit}>
							<div className="mb-3">
								<CFormLabel htmlFor="studentSpreadsheet">
									Select Student Spreadsheet (.xlsx, .csv)
								</CFormLabel>
								<CFormInput
									type="file"
									id="studentSpreadsheet"
									accept=".xlsx, .csv"
									onChange={handleFileChange}
									required
								/>
							</div>

							{spreadsheetData && (
								<div className="mb-3">
									<CFormLabel htmlFor="sheetSelect">
										Select Sheet
									</CFormLabel>
									<CFormSelect
										id="sheetSelect"
										value={selectedSheet || ""}
										onChange={handleSheetChange}
										required>
										<option value="" disabled>
											Select a sheet
										</option>
										{sheetNames.map((name, index) => (
											<option key={index} value={name}>
												{name}
											</option>
										))}
									</CFormSelect>
								</div>
							)}

							{selectedSheet && headers.length > 0 && (
								<div className="mb-3">
									<p className="text-center mt-2">
										Map Spreadsheet Columns to Database
										Fields
									</p>
									<CTable striped>
										<CTableHead>
											<CTableRow>
												<CTableHeaderCell>
													Spreadsheet Column
												</CTableHeaderCell>
												<CTableHeaderCell>
													Database Field
												</CTableHeaderCell>
											</CTableRow>
										</CTableHead>
										<CTableBody>
											{headers.map((header, index) => (
												<CTableRow key={index}>
													<CTableDataCell>
														{header}
													</CTableDataCell>
													<CTableDataCell>
														<CFormSelect
															value={
																fieldMappings[
																	header
																] || ""
															}
															onChange={(e) =>
																handleFieldMappingChange(
																	header,
																	e.target
																		.value
																)
															}>
															<option value="">
																Ignore
															</option>
															{databaseFields.map(
																(field) => (
																	<option
																		key={
																			field
																		}
																		value={
																			field
																		}>
																		{field}
																	</option>
																)
															)}
														</CFormSelect>
													</CTableDataCell>
												</CTableRow>
											))}
										</CTableBody>
									</CTable>
								</div>
							)}

							{selectedSheet && sampleData.length > 0 && (
								<>
									<p className="mt-5 text-center w-100">
										Sheet Data
									</p>
									<div className="mb-3 overflow-auto">
										<CTable bordered small>
											<CTableHead>
												<CTableRow>
													{headers.map(
														(header, index) => (
															<CTableHeaderCell
																key={index}>
																{header}
															</CTableHeaderCell>
														)
													)}
												</CTableRow>
											</CTableHead>
											<CTableBody>
												{sampleDataDisplay &&
													sampleDataDisplay.map(
														(row, index) => (
															<CTableRow
																key={index}>
																{headers.map(
																	(
																		header
																	) => (
																		<CTableDataCell
																			key={
																				header
																			}>
																			{
																				row[
																					header
																				]
																			}
																		</CTableDataCell>
																	)
																)}
															</CTableRow>
														)
													)}
											</CTableBody>
										</CTable>
									</div>
									<p className="form-text text-muted text-center">
										Showing a preview of {pageCount} rows.
									</p>
									<div className="row d-none">
										<div className="col col-3">
											<CFormLabel htmlFor="startPageCount">
												Start Row
											</CFormLabel>
											<CFormInput
												type="number"
												id="startPageCount"
												placeholder="Start Row"
												min={1}
												value={startPage}
												onChange={(e) =>
													setStartPage(e.target.value)
												}
												required
											/>
										</div>
										<div className="col col-3">
											<CFormLabel htmlFor="startPageCount">
												Number of Rows
											</CFormLabel>
											<CFormInput
												type="number"
												id="startPageCount"
												placeholder="No. of Rows"
												min={1}
												max={10}
												value={pageCount}
												onChange={(e) =>
													setPageCount(e.target.value)
												}
												required
											/>
										</div>
									</div>
								</>
							)}

							{selectedSheet && (
								<div className="my-3">
									<CFormLabel htmlFor="cohortInput">
										Cohort
									</CFormLabel>
									<CFormInput
										type="text"
										id="cohortInput"
										placeholder="e.g., 2023"
										value={cohort}
										onChange={handleCohortChange}
										required
									/>
									<small className="form-text text-muted">
										Enter the cohort year for these
										students.
									</small>
								</div>
							)}

							{selectedSheet && (
								<div className="d-grid">
									<CButton
										type="submit"
										color="primary"
										disabled={!selectedSheet}>
										Upload Students
									</CButton>
								</div>
							)}
						</CForm>
					</CCardBody>
				</CCard>
			</CCol>
		</CRow>
	);
};

export default UploadStudents;
