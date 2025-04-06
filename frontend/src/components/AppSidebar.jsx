import React from "react";
import { useSelector, useDispatch } from "react-redux";

import {
	CCloseButton,
	CSidebar,
	CSidebarBrand,
	CSidebarFooter,
	CSidebarHeader,
	CSidebarToggler,
} from "@coreui/react";
import { Link } from "react-router-dom";

import { AppSidebarNav } from "./AppSidebarNav";

// import { logo } from 'src/assets/brand/logo'
// import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from "../_nav";

const AppSidebar = () => {
	const dispatch = useDispatch();
	const unfoldable = useSelector((state) => state.sidebarUnfoldable);
	const sidebarShow = useSelector((state) => state.sidebarShow);

	return (
		<CSidebar
			className="border-end rounded-end"
			// colorScheme="dark"
			position="fixed"
			unfoldable={unfoldable}
			visible={sidebarShow}
			onVisibleChange={(visible) => {
				dispatch({ type: "set", sidebarShow: visible });
			}}>
			<CSidebarHeader className="border-bottom">
				<CSidebarBrand
					as={Link}
					to="/dashboard"
					className="w-100 d-flex">
					<img
						className="sidebar-brand-full mx-auto"
						src="/img/S_logo_full.svg"
						alt="Schoolr Logo"
						height={32}
					/>
					<img
						className="sidebar-brand-narrow mx-auto"
						src="/img/S_logo.ico"
						height={32}
					/>
				</CSidebarBrand>
				<CCloseButton
					className="d-lg-none"
					dark
					onClick={() =>
						dispatch({ type: "set", sidebarShow: false })
					}
				/>
			</CSidebarHeader>
			<AppSidebarNav items={navigation} />
			<CSidebarFooter className="border-top d-none d-lg-flex">
				<CSidebarToggler
					className="ms-auto text-dark-emphasis"
					onClick={() =>
						dispatch({
							type: "set",
							sidebarUnfoldable: !unfoldable,
						})
					}
				/>
			</CSidebarFooter>
		</CSidebar>
	);
};

export default React.memo(AppSidebar);
