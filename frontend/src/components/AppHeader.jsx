import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
	CContainer,
	CDropdown,
	CDropdownItem,
	CDropdownMenu,
	CDropdownToggle,
	CHeader,
	CHeaderNav,
	CHeaderToggler,
	CNavLink,
	CNavItem,
	useColorModes,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import {
	cilBell,
	cilContrast,
	cilEnvelopeOpen,
	cilList,
	cilMenu,
	cilMoon,
	cilSun,
} from "@coreui/icons";

import { AppBreadcrumb } from "./index";
import { AppHeaderDropdown } from "./header/index";
import { setAppState } from "../store/appSlice";
import { getSchoolProfile } from "../store/schoolSlice";

const AppHeader = ({ routes }) => {
	const headerRef = useRef();
	const { colorMode, setColorMode } = useColorModes("Schoolr");

	const dispatch = useDispatch();
	const sidebarShow = useSelector((state) => state.app.sidebarShow);
	const schoolData = useSelector((state) => state.school.school);

	useEffect(() => {
		document.addEventListener("scroll", () => {
			headerRef.current &&
				headerRef.current.classList.toggle(
					"shadow-sm",
					document.documentElement.scrollTop > 0
				);
		});
	}, []);

	return (
		<CHeader
			position="sticky"
			className="mb-4 p-0 rounded-bottom"
			ref={headerRef}>
			<CContainer className="border-bottom headerGradient px-4" fluid>
				<CHeaderToggler
					onClick={() =>
						dispatch(setAppState({ sidebarShow: !sidebarShow }))
					}
					style={{ marginInlineStart: "-14px" }}>
					<CIcon icon={cilMenu} size="lg" />
				</CHeaderToggler>
				<CHeaderNav className="d-none d-md-flex">
					<CNavItem className="px-md-4">
						<h5 className="mb-0">{schoolData&&schoolData.name} <span class="badge rounded px-2 ms-1" style={{backgroundColor: schoolData&&schoolData.color, color: 'transparent', userSelect: 'none'}}>{1}</span></h5>
					</CNavItem>
					{/* <CNavItem>
						<CNavLink to="/dashboard" as={NavLink}>
							Dashboard
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink href="#">Users</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink href="#">Settings</CNavLink>
					</CNavItem> */}
				</CHeaderNav>
				<CHeaderNav className="ms-auto">
					<CNavItem>
						<CNavLink href="#">
							<i className="fa-duotone fa-light fa-bell fs-5"></i>
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink href="#">
							<CIcon icon={cilList} size="lg" />
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink href="#">
							<i className="fa-duotone fa-solid fa-messages fs-5"></i>
						</CNavLink>
					</CNavItem>
				</CHeaderNav>
				<CHeaderNav>
					<li className="nav-item py-1">
						<div className="vr h-100 mx-2 text-body text-opacity-75"></div>
					</li>
					<CDropdown variant="nav-item" placement="bottom-end">
						<CDropdownToggle caret={false}>
							{colorMode === "dark" ? (
								<i className="fa-regular fa-moon-stars fs-5"></i>
							) : colorMode === "auto" ? (
								<i className="fa-duotone fa-regular fa-circle-half-stroke fs-5"></i>
							) : (
								<i className="fa-regular fa-sun-bright fs-5"></i>
							)}
						</CDropdownToggle>
						<CDropdownMenu>
							<CDropdownItem
								active={colorMode === "light"}
								className="d-flex align-items-center"
								as="button"
								type="button"
								onClick={() => setColorMode("light")}>
								<i className="fa-regular fa-sun-bright fs-5 me-2"></i>{" "}
								Light
							</CDropdownItem>
							<CDropdownItem
								active={colorMode === "dark"}
								className="d-flex align-items-center"
								as="button"
								type="button"
								onClick={() => setColorMode("dark")}>
								<i className="fa-regular fa-moon-stars fs-5 me-2"></i>{" "}
								Dark
							</CDropdownItem>
							<CDropdownItem
								active={colorMode === "auto"}
								className="d-flex align-items-center"
								as="button"
								type="button"
								onClick={() => setColorMode("auto")}>
								<i className="fa-duotone fa-regular fa-circle-half-stroke fs-5 me-2"></i>{" "}
								Auto
							</CDropdownItem>
						</CDropdownMenu>
					</CDropdown>
					<li className="nav-item py-1">
						<div className="vr h-100 mx-2 text-body text-opacity-75"></div>
					</li>
					<AppHeaderDropdown />
				</CHeaderNav>
			</CContainer>
			<CContainer className="px-4" fluid>
				<AppBreadcrumb routes={routes} />
			</CContainer>
		</CHeader>
	);
};

export default AppHeader;
