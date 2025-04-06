import { cilChartPie } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import {
	CCol,
	CDropdown,
	CDropdownItem,
	CDropdownMenu,
	CDropdownToggle,
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
import { Link, NavLink, useSearchParams } from "react-router-dom";
import legendsData from "../../assets/sample_data/legends";

const streams = ["form1", "form2", "form3", "form4"];

import avatar4 from "./../../assets/images/avatars/4.jpg";

const StudentProfile = () => {
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
			<div className="card mb-3">
				<div className="card-body d-flex flex-wrap flex-between-center">
					<div className="col">
						<h6 className="text-primary">Learner</h6>
						<h5 className="mb-0">Michael Giacchino</h5>
					</div>
					<div className="col d-flex justify-content-end">
						<button
							className="btn btn-primary btn-md me-2"
							type="button">
							<i className="fa-regular fa-envelope"></i>{" "}
							<span className="d-none d-md-inline">Message</span>
						</button>
						<button
							className="btn btn-outline-secondary btn-md"
							type="button">
							<i className="fa-regular fa-envelope"></i>{" "}
							<span className="d-none d-md-inline">
								Followers
							</span>
						</button>
					</div>
				</div>
			</div>

			<div className="row g-3 mb-3">
				<div className="col col-12">
					<div className="row g-3">
						<div className="col-12">
							<div className="card font-sans-serif">
								<div className="card-body d-flex gap-3 flex-column flex-sm-row align-items-center">
									<img
										className="rounded-3"
										src={avatar4}
										alt="Student Profile"
										width="112"
									/>
									<table className="table table-borderless fs-10 fw-medium mb-0">
										<tbody>
											<tr>
												<td
													className="p-1"
													style={{ width: "35%" }}>
													Last Online:
												</td>
												<td className="p-1 text-600">
													3 hours ago
												</td>
											</tr>
											<tr>
												<td
													className="p-1"
													style={{ width: "35%" }}>
													Joined:
												</td>
												<td className="p-1 text-600">
													2021/01/12 23:13
												</td>
											</tr>
											<tr>
												<td
													className="p-1"
													style={{ width: "35%" }}>
													Email:
												</td>
												<td className="p-1">
													<a
														className="text-600 text-decoration-none"
														href="mailto:goodguy@nicemail.com">
														goodguy@nicemail.com{" "}
													</a>
													<span className="badge rounded-pill badge-subtle-success d-md-inline-block ms-md-2">
														<span>Verified</span>
														<i className="fa-regular fa-check ms-2"></i>
													</span>
												</td>
											</tr>
											<tr>
												<td
													className="p-1"
													style={{ width: "35%" }}>
													Mobile No:
												</td>
												<td className="p-1">
													<a
														className="text-600 text-decoration-none"
														href="tel:+01234567890 ">
														+254-112-345567{" "}
													</a>
													<span className="badge rounded-pill badge-subtle-primary d-md-inline-block ms-md-2">
														<span>
															2-step verification
														</span>
														<i className="fa-regular fa-link ms-2"></i>
													</span>
												</td>
											</tr>
										</tbody>
									</table>
									<div className="dropdown position-absolute top-0 end-0 m-3">
										<CDropdown alignment="end">
											<CDropdownToggle color="">
												<i className="fa-regular fa-ellipsis-h ms-2"></i>
											</CDropdownToggle>
											<CDropdownMenu>
												<CDropdownItem as={Link} to="/">
													Action
												</CDropdownItem>
												<CDropdownItem as={Link} to="/">
													Another action
												</CDropdownItem>
												<li>
													<hr class="dropdown-divider" />
												</li>
												<CDropdownItem as={Link} className="text-danger" to="/">
													Sth else here
												</CDropdownItem>
											</CDropdownMenu>
										</CDropdown>
										{/* <button
											className="btn btn-link btn-reveal text-600 btn-sm dropdown-toggle dropdown-caret-none"
											type="button"
											id="studentInfoDropdown"
											data-bs-toggle="dropdown"
											data-boundary="viewport"
											aria-haspopup="true"
											aria-expanded="false">
											<i className="fa-regular fa-ellipsis-h ms-2"></i>
										</button>
										<div
											className="dropdown-menu dropdown-menu-end border py-2"
											aria-labelledby="studentInfoDropdown">
											<a
												className="dropdown-item"
												href="#!">
												View Profile
											</a>
											<a
												className="dropdown-item"
												href="#!">
												Enrolled Courses
											</a>
											<div className="dropdown-divider"></div>
											<a
												className="dropdown-item text-danger"
												href="#!">
												Logout
											</a>
										</div> */}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* {currentStream.replace("form", "Form ")} */}
			<CTable className="mt-3" hover bordered>
				<CTableHead>
					<CTableRow>
						<CTableHeaderCell
							scope="col"
							className="bg-body-tertiary rounded-start">
							Adm No
						</CTableHeaderCell>
						<CTableHeaderCell
							scope="col"
							className="bg-body-tertiary">
							Name
						</CTableHeaderCell>
						<CTableHeaderCell
							scope="col"
							className="bg-body-tertiary">
							Stream
						</CTableHeaderCell>
						<CTableHeaderCell
							scope="col"
							className="bg-body-tertiary rounded-end">
							Actions
						</CTableHeaderCell>
					</CTableRow>
				</CTableHead>
				<CTableBody>
					{currentData.map((record) => {
						return (
							<CTableRow key={record.ADMNO}>
								<CTableHeaderCell
									scope="row"
									className="ps-2 rounded-start bg-body-subtle">
									{record.ADMNO}
								</CTableHeaderCell>
								<CTableDataCell className="bg-body-subtle">
									{record.NAME}
								</CTableDataCell>
								<CTableDataCell className="bg-body-subtle">
									{record.STR}
								</CTableDataCell>
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

export default StudentProfile;
