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
import { uploadTeacherData } from "../../../store/schoolSlice";
import * as XLSX from "xlsx";
import { addToast } from "../../../store/toastSlice";

const UploadTeachers = () => {
	const [file, setFile] = useState(null);
	const [spreadsheetData, setSpreadsheetData] = useState(null);
	const [selectedSheet, setSelectedSheet] = useState(null);
	const [fieldMappings, setFieldMappings] = useState({});
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
		if (spreadsheetData && spreadsheetData.Sheets[sheetName]) {
			const headers =
				XLSX.utils.sheet_to_json(spreadsheetData.Sheets[sheetName], {
					header: 1,
				})[0] || [];
			const initialMappings = {};
			headers.forEach((header) => {
				initialMappings[header] = "";
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

	const handleSubmit = useCallback(
		async (e) => {
			e.preventDefault();

			if (!file || !selectedSheet) {
				alert("Please select a file and a sheet.");
				return;
			}

			const jsonData = XLSX.utils.sheet_to_json(
				spreadsheetData.Sheets[selectedSheet]
			);
			const uploadData = jsonData.map((row) => {
				const mappedRow = {};
				for (const header in fieldMappings) {
					if (fieldMappings[header]) {
						const field = fieldMappings[header];
						let value = row[header];

						// Convert subjects_taught from comma-separated string to array
						if (
							field === "subjects_taught" &&
							typeof value === "string"
						) {
							value = value
								.split(",")
								.map((s) => s.trim())
								.filter(Boolean);
						}

						mappedRow[field] = value;
					}
				}
				return mappedRow;
			});

			try {
				const res = await dispatch(
					uploadTeacherData({
						teachersData: uploadData,
						schoolId: schoolId,
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
					// Navigate to teachers list page
				} else if (res?.error) {
					dispatch(
						addToast({
							id: Date.now(),
							message: res.payload,
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
						message: err,
						title: "Error",
						color: "#e55353",
						timestamp: Date.now(),
					})
				);
			}
		},
		[file, selectedSheet, fieldMappings, schoolId, dispatch]
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

	const databaseFields = [
		"employee_number",
		"kra_pin",
		"national_id",
		"first_name",
		"middle_name",
		"surname",
		"subjects_taught",
	];

	return (
		<CRow className="d-flex justify-content-center mb-4">
			<CCol xs={12} md={10}>
				<CCard className="mb-4">
					<CCardHeader>
						<strong>Upload Teacher Data (Spreadsheet)</strong>
					</CCardHeader>
					<CCardBody>
						<CForm onSubmit={handleSubmit}>
							<div className="mb-3">
								<CFormLabel htmlFor="teacherSpreadsheet">
									Select Teacher Spreadsheet (.xlsx, .csv)
								</CFormLabel>
								<CFormInput
									type="file"
									id="teacherSpreadsheet"
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
									<CFormLabel>
										Map Spreadsheet Columns to Database
										Fields
									</CFormLabel>
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
								<div className="mb-3">
									<CFormLabel>Sample Data</CFormLabel>
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
											{sampleData
												.slice(0, 5)
												.map((row, index) => (
													<CTableRow key={index}>
														{headers.map(
															(header) => {
																let value =
																	row[header];

																// Convert subjects_taught (if present) to an array and stringify it for display
																if (
																	header ===
																		"subjects_taught" &&
																	typeof value ===
																		"string"
																) {
																	value =
																		value
																			.split(
																				","
																			)
																			.map(
																				(
																					s
																				) =>
																					s.trim()
																			)
																			.filter(
																				Boolean
																			);
																}

																// Stringify the array if the value is an array
																return (
																	<CTableDataCell
																		key={
																			header
																		}>
																		{Array.isArray(
																			value
																		)
																			? JSON.stringify(
																					value
																			  ) // Convert array to string for display
																			: value}
																	</CTableDataCell>
																);
															}
														)}
													</CTableRow>
												))}
										</CTableBody>
									</CTable>
									<small className="form-text text-muted">
										Showing a preview of the first 5 rows.
									</small>
								</div>
							)}

							{selectedSheet && (
								<div className="d-grid">
									<CButton
										type="submit"
										color="primary"
										disabled={!selectedSheet}>
										Upload Teachers
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

export default UploadTeachers;
