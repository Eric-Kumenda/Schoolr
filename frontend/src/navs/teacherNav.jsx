import React from "react";
import { CNavGroup, CNavItem } from "@coreui/react";

const teacherNav = [
	{
		component: CNavGroup,
		name: "Dashboard",
		icon: <i className="fa-duotone fa-solid fa-house-window nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Summary",
				to: "/teacher",
			},
			{
				component: CNavItem,
				name: "Messages",
				to: "/dashboard/badges",
			},
			{
				component: CNavItem,
				name: "Schedule",
				to: "/dashboard/schedule",
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
				to: "/school/profile",
			},
			{
				component: CNavItem,
				name: "Billing",
				to: "/school/billing",
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
				name: "Streams",
				to: "/students/streams",
			},
			{
				component: CNavItem,
				name: "Classes",
				to: "/students/classes",
			},
			{
				component: CNavItem,
				name: "Profile",
				to: "/students/profile",
			},
		],
	},
	{
		component: CNavItem,
		name: "Messages",
		to: "/teacher/chat",
		icon: <i className="fa-solid fa-comment nav-icon"></i>,
	},
	{
		component: CNavGroup,
		name: "Attendance",
		icon: <i className="fa-regular fa-clipboard-list-check nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Take Attendance",
				to: "/teacher/attendance/take",
			},
			{
				component: CNavItem,
				name: "Student Attendance",
				to: "/teacher/students/:studentId/attendance",
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
		to: "/teacher/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
];

export default teacherNav;
