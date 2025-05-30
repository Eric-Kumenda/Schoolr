import React from "react";
import { CNavGroup, CNavItem } from "@coreui/react";

const adminNav = [
	{
		component: CNavGroup,
		name: "Dashboard",
		icon: <i className="fa-duotone fa-solid fa-house-window nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Summary",
				to: "/admin",
			},
		],
	},
	{
		component: CNavGroup,
		name: "School",
		icon: <i className="fa-regular fa-school nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Profile",
				to: "/admin/school/profile",
			},
			{
				component: CNavItem,
				name: "Pending Requests",
				to: "/admin/school/pending-requests",
			},
			{
				component: CNavItem,
				name: "Billing",
				to: "/admin/school/billing",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Staff",
		icon: <i className="fa-duotone fa-light fa-users-line nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Teachers",
				to: "/admin/teachers/list",
			},
			{
				component: CNavItem,
				name: "Teachers Upload",
				to: "/admin/teachers/upload",
			},
			// {
			// 	component: CNavItem,
			// 	name: "Non-Teaching",
			// 	to: "/notifications/badges",
			// },
			{
				component: CNavItem,
				name: "Profile",
				to: "/admin/teachers/profile",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Students",
		icon: <i className="fa-solid fa-graduation-cap nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "List",
				to: "/admin/students/list",
			},
			{
				component: CNavItem,
				name: "Classes",
				to: "/admin/students/classes",
			},
			{
				component: CNavItem,
				name: "Students Upload",
				to: "/admin/students/upload",
			},
			{
				component: CNavItem,
				name: "Profile",
				to: "/admin/students/profile",
			},
		],
	},
	{
		component: CNavItem,
		name: "Messages",
		to: "/admin/chat",
		icon: <i className="fa-solid fa-comment nav-icon"></i>,
	},
	{
		component: CNavGroup,
		name: "Admission",
		icon: <i className="fa-solid fa-user-plus nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "New Student",
				to: "/admin/admission/new",
			},
			{
				component: CNavItem,
				name: "Link Account",
				to: "/admin/link-user",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Fees and Invoice",
		icon: <i className="fa-solid fa-wallet nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Officers",
				to: "/admin/finance/officers",
			},
			{
				component: CNavItem,
				name: "Balances",
				to: "/admin/finance/balances",
			},
			{
				component: CNavItem,
				name: "Expenditure",
				to: "/admin/finance/expenditure",
			},
			{
				component: CNavItem,
				name: "Claims",
				to: "/admin/finance/claims",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Exams",
		icon: <i className="fa-regular fa-clipboard-list nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Create Exam",
				to: "/admin/exams/create",
			},
			{
				component: CNavItem,
				name: "Manage Exams",
				to: "/admin/exams",
			},
		],
	},
	
	{
		component: CNavItem,
		name: "Settings",
		to: "/admin/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
];

export default adminNav;
