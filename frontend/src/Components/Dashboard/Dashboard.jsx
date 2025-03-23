import React from "react";
import "./Dashboard.css";
import {
	CBadge,
	CSidebar,
	CSidebarBrand,
	CSidebarHeader,
	CSidebarFooter,
	CSidebarNav,
	CSidebarToggler,
	CNavGroup,
	CNavItem,
	CNavTitle,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
	cilCloudDownload,
	cilHouse,
	cilLayers,
	cilPuzzle,
	cilSpeedometer,
} from "@coreui/icons";
import { Link } from "react-router-dom";

import { useSelector, useDispatch } from "react-redux";

const Dashboard = () => {
	return (
		<>
			{/* 
			 <div className="container-fluid min-vh-100">
				<div className="row d-flex justify-space-between ps-0">
					<nav
						className={`col sidebar bg-body-tertiary d-none d-lg-block px-2 rounded col-${
							sideBarExpandedState ? "2" : "1"
						}`}>
						<div className="container-fluid w-100 py-3 d-flex flex-column">
							<Link
								className="navbar-brand mx-auto w-100 mb-2"
								to="/dashboard">
								<img
									src="/img/S_logo.png"
									alt="Schoolr Logo"
									className="img-fluid"
									style={{ maxHeight: "40px" }}
								/>
								<span
									className={`text-primary fw-bolder fs-4 ${
										sideBarExpandedState ? "" : "d-none"
									}`}>
									Schoolr
								</span>
							</Link>
							<div
								className="accordion w-100"
								id="dashboardAccordion">
								<div className="accordion-item">
									<h2 className="accordion-header">
										<button
											className="accordion-button"
											type="button"
											data-bs-toggle="collapse"
											data-bs-target="#menu1"
											aria-expanded="true"
											aria-controls="menu1">
											<i className="fa fa-house-door mx-1"></i>Dashboard
										</button>
									</h2>
									<div
										id="menu1"
										className="accordion-collapse collapse show"
										data-bs-parent="#dashboardAccordion">
										<div className="accordion-body">
											<ul>
												<li>1</li>
												<li>2</li>
												<li>3</li>
											</ul>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="container-fluid position-relative w-100 h-auto">
							<div className="position-sticky bottom-0 h-auto">
								<button
									className="btn w-100 bg-primary-subtle mb-3 mt-1 mx-auto"
									type="button"
									style={{
										transition: "width 0.4s ease-in-out",
										overflowX: "hidden",
									}}
									onClick={() =>
										setSideExpandedBarState(
											!sideBarExpandedState
										)
									}>
									<i
										className={`bi bi-arrow-bar-${
											sideBarExpandedState
												? "left"
												: "right"
										}`}></i>
									<span
										className={`text-emphasis ${
											sideBarExpandedState ? "" : "d-none"
										}`}>
										{" "}
										Collapse View
									</span>
								</button>
							</div>
						</div>
					</nav>
					Main Content 
					<div
						className={`col main-content col-${
							sideBarExpandedState
								? "10"
								: "11"
						}`}>
						Col Right
					</div>
				</div>
			</div> 
			 */}
			<CSidebar className="border-end">
				<CSidebarHeader className="border-bottom">
					<CSidebarBrand
						as={Link}
						to="/dashboard"
						className="w-100 d-flex">
						<img
							className="sidebar-brand-full mx-auto"
							src="/img/S_logo_full.svg"
							alt="Schoolr Logo"
							height={36}
						/>
						<img
							className="sidebar-brand-narrow mx-auto"
							src="/img/S_logo.ico"
							height={32}
						/>
					</CSidebarBrand>
				</CSidebarHeader>
				<CSidebarNav>
					<CNavTitle>MENU</CNavTitle>
					<CNavItem as={Link} to="/">
						<CIcon customClassName="nav-icon" icon={cilHouse} /> Nav
						item
					</CNavItem>
					<CNavItem as={Link} to="/">
						<CIcon
							customClassName="nav-icon"
							icon={cilSpeedometer}
						/>{" "}
						With badge <CBadge color="primary ms-auto">NEW</CBadge>
					</CNavItem>
					<CNavGroup
						toggler={
							<>
								<CIcon
									customClassName="nav-icon"
									icon={cilPuzzle}
								/>{" "}
								Nav dropdown
							</>
						}>
						<CNavItem as={Link} to="#">
							<span className="nav-icon">
								<span className="nav-icon-bullet"></span>
							</span>{" "}
							Nav dropdown item
						</CNavItem>
						<CNavItem as={Link} to="#">
							<span className="nav-icon">
								<span className="nav-icon-bullet"></span>
							</span>{" "}
							Nav dropdown item
						</CNavItem>
					</CNavGroup>
					<CNavItem as={Link} to="/">
						<CIcon
							customClassName="nav-icon"
							icon={cilCloudDownload}
						/>{" "}
						Download CoreUI
					</CNavItem>
					<CNavItem as={Link} to="/">
						<CIcon customClassName="nav-icon" icon={cilLayers} />{" "}
						Try CoreUI PRO
					</CNavItem>
				</CSidebarNav>
				<CSidebarFooter className="border-top d-none d-md-flex">
					<CSidebarToggler></CSidebarToggler>
				</CSidebarFooter>
			</CSidebar>
			<div className="wrapper d-flex flex-column min-vh-100">
				{/* <AppHeader /> */}
				<div className="body flex-grow-1">
					{/* <AppContent /> */}
					Here's the body section
				</div>
				{/* <AppFooter /> */}
			</div>
		</>
	);
};

export default Dashboard;
