import { cilChartPie } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
	CCol,
	CNav,
	CNavItem,
	CNavLink,
	CRow,
	CTable,
	CTableBody,
	CTableDataCell,
	CTableHead,
	CTableHeaderCell,
	CTableRow,
	CWidgetStatsF,
} from "@coreui/react";
import React, { useEffect, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import legendsData from "../../assets/sample_data/legends";

const streams = ["form1", "form2", "form3", "form4"];

const Classes = () => {
	const [start, setStart] = useState(0);
	const [activeSelection, setActiveSelection] = useState(null);
	const itemsPerPage = 10; // No of items to display per page

	// Calculate the end index
	const end = start + itemsPerPage;

	// Get the current slice of data
	const currentData = legendsData.slice(start, end);

	const handleRecordClick = (AdmNo) => {
		setActiveSelection(AdmNo);
	};

	const [searchParams, setSearchParams] = useSearchParams();
	const currentStream = searchParams.get("stream") || "form1";

	// useEffect(() => {
	// 	console.log(activeSelection);
	// }, [activeSelection]);

	
	return (
		<>
			<CNav
				variant="underline-border"
				className="w-100 justify-content-center mb-2">
				{streams.map((stream) => (
					<CNavItem key={stream} className="me-1">
						<CNavLink
							as={NavLink}
							className={`${
								currentStream === stream
									? "active text-primary bg-body-tertiar"
									: "text-body"
							} px-1`}
							style={{
								textDecoration: "none",
								padding: "10px",
								display: "block",
								borderBottom:
									currentStream === stream
										? "2px solid purple"
										: "none",
							}}
							to={`/students/classes?class=${stream}`}
							active={currentStream === stream} //Highlights active tab
						>
							{stream.replace("form", "Form ")}
						</CNavLink>
					</CNavItem>
				))}
			</CNav>
			

			{/* {currentStream.replace("form", "Form ")} */}
			<CTable className="mt-3" hover bordered>
				<CTableHead>
					<CTableRow>
						<CTableHeaderCell scope="col" className="bg-body-tertiary rounded-start">Adm No</CTableHeaderCell>
						<CTableHeaderCell scope="col" className="bg-body-tertiary">Name</CTableHeaderCell>
						<CTableHeaderCell scope="col" className="bg-body-tertiary">Stream</CTableHeaderCell>
						<CTableHeaderCell scope="col" className="bg-body-tertiary rounded-end">Actions</CTableHeaderCell>
					</CTableRow>
				</CTableHead>
				<CTableBody>
					{currentData.map((record) => {
						return (
							<CTableRow key={record.ADMNO}>
								<CTableHeaderCell scope="row" className="ps-2 rounded-start bg-body-subtle">
									{record.ADMNO}
								</CTableHeaderCell>
								<CTableDataCell className="bg-body-subtle">{record.NAME}</CTableDataCell>
								<CTableDataCell className="bg-body-subtle">{record.STR}</CTableDataCell>
								<CTableDataCell className="rounded-end bg-body-subtle">
									<button
										className="btn btn-outline-warning px-3"
										type="button"
										onClick={() =>
											handleRecordClick(record.ADMNO)
										}>
										<i className="fa-regular fa-file-user"></i>
									</button>
								</CTableDataCell>
							</CTableRow>
						);
					})}
				</CTableBody>
			</CTable>
		</>
	);
};

export default Classes;
