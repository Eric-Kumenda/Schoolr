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
				to: "/admin/dashboard",
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
		name: "Attendance",
		icon: <i className="fa-regular fa-clipboard-list-check nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Alerts",
				to: "/notifications/alerts",
			},
			{
				component: CNavItem,
				name: "Badges",
				to: "/notifications/badges",
			},
			{
				component: CNavItem,
				name: "Modal",
				to: "/notifications/modals",
			},
			{
				component: CNavItem,
				name: "Toasts",
				to: "/notifications/toasts",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Admission",
		icon: <i className="fa-solid fa-user-plus nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "New Student",
				to: "/admission/new",
			},
			{
				component: CNavItem,
				name: "Current Student",
				to: "/admission/current",
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
				to: "/finance/officers",
			},
			{
				component: CNavItem,
				name: "Balances",
				to: "/finance/balances",
			},
			{
				component: CNavItem,
				name: "Expenditure",
				to: "/finance/expenditure",
			},
			{
				component: CNavItem,
				name: "Claims",
				to: "/finance/claims",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Boarding",
		icon: <i className="fa-regular fa-building-user nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Houses",
				to: "/boarding/houses",
			},
			{
				component: CNavItem,
				name: "Dorms",
				to: "/boarding/dorms",
			},
			{
				component: CNavItem,
				name: "Patrons",
				to: "/boarding/patrons",
			},
			{
				component: CNavItem,
				name: "Prefects",
				to: "/boarding/prefects",
			},
		],
	},
	
	{
		component: CNavItem,
		name: "Settings",
		to: "/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
	{
		component: CNavItem,
		name: "Login",
		to: '/loginStudent',
		icon: <i className="fa-regular fa-user-unlock nav-icon"></i>,
	},
];

export default adminNav;
