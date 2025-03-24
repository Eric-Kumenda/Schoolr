import React, { useEffect, useRef } from "react";
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

const AppHeader = () => {
	const headerRef = useRef();
	const { colorMode, setColorMode } = useColorModes(
		"coreui-free-react-admin-template-theme"
	);

	const dispatch = useDispatch();
	const sidebarShow = useSelector((state) => state.sidebarShow);

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
		<CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
			<CContainer className="border-bottom px-4" fluid>
				<CHeaderToggler
					onClick={() =>
						dispatch({ type: "set", sidebarShow: !sidebarShow })
					}
					style={{ marginInlineStart: "-14px" }}>
					<CIcon icon={cilMenu} size="lg" />
				</CHeaderToggler>
				<CHeaderNav className="d-none d-md-flex">
					<CNavItem className="px-md-4">
						<h5 className="mb-0">Welcome Lanii!</h5>
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
							<i class="fa-duotone fa-light fa-bell fs-5"></i>
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink href="#">
							<CIcon icon={cilList} size="lg" />
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink href="#">
							<i class="fa-duotone fa-solid fa-messages fs-5"></i>
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
								<i class="fa-regular fa-moon-stars fs-5"></i>
							) : colorMode === "auto" ? (
								<i class="fa-duotone fa-regular fa-circle-half-stroke fs-5"></i>
							) : (
								<i class="fa-regular fa-sun-bright fs-5"></i>
							)}
						</CDropdownToggle>
						<CDropdownMenu>
							<CDropdownItem
								active={colorMode === "light"}
								className="d-flex align-items-center"
								as="button"
								type="button"
								onClick={() => setColorMode("light")}>
								<i class="fa-regular fa-sun-bright fs-5 me-2"></i>{" "}
								Light
							</CDropdownItem>
							<CDropdownItem
								active={colorMode === "dark"}
								className="d-flex align-items-center"
								as="button"
								type="button"
								onClick={() => setColorMode("dark")}>
								<i class="fa-regular fa-moon-stars fs-5 me-2"></i>{" "}
								Dark
							</CDropdownItem>
							<CDropdownItem
								active={colorMode === "auto"}
								className="d-flex align-items-center"
								as="button"
								type="button"
								onClick={() => setColorMode("auto")}>
								<i class="fa-duotone fa-regular fa-circle-half-stroke fs-5 me-2"></i>{" "}
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
			{/* <CContainer className="px-4" fluid>
				<AppBreadcrumb />
			</CContainer> */}
		</CHeader>
	);
};

export default AppHeader;
