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
					name: "List",
					to: "/teacher/students/list",
				},
				{
					component: CNavItem,
					name: "Classes",
					to: "/teacher/students/classes",
				},
				{
					component: CNavItem,
					name: "Profile",
					to: "/teacher/students/profile",
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
		component: CNavItem,
		name: "Settings",
		to: "/teacher/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
];

export default teacherNav;
