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

import adminNav from "../navs/adminNav";
import teacherNav from "../navs/teacherNav";
import studentNav from "../navs/studentNav";
import parentNav from "../navs/parentNav";
import financeNav from "../navs/financeNav";
import { setAppState } from "../store/appSlice";

const AppSidebar = () => {
	const dispatch = useDispatch();
	const role = useSelector((state) => state.auth.role);
	const unfoldable = useSelector((state) => state.app.sidebarUnfoldable);
	const sidebarShow = useSelector((state) => state.app.sidebarShow);
	let navConfig = [];

	switch (role) {
		case "admin":
			navConfig = adminNav;
			break;
		case "teacher":
			navConfig = teacherNav;
			break;
		case "student":
			navConfig = studentNav;
			break;
		case "parent":
			navConfig = parentNav;
			break;
		case "finance":
			navConfig = financeNav;
			break;
		default:
			navConfig = [];
	}

	return (
		<CSidebar
			className="border-end rounded-end bg-body"
			position="fixed"
			unfoldable={unfoldable}
			visible={sidebarShow}
			onVisibleChange={(visible) => {
				dispatch({ type: "set", sidebarShow: visible });
			}}>
			<CSidebarHeader className="border-bottom">
				<CSidebarBrand
					as={Link}
					to={`/${role}`}
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
						dispatch(setAppState({ sidebarShow: false }))
					}
				/>
			</CSidebarHeader>
			<AppSidebarNav items={navConfig} />
			<CSidebarFooter className="border-top d-none d-lg-flex">
				<CSidebarToggler
					className="ms-auto text-dark-emphasis"
					onClick={() =>
						dispatch(setAppState({ sidebarUnfoldable: !unfoldable }))
					}
				/>
			</CSidebarFooter>
		</CSidebar>
	);
};

export default React.memo(AppSidebar);
