import React from "react";
import { CNavGroup, CNavItem } from "@coreui/react";

const parentNav = [
	{
		component: CNavGroup,
		name: "Dashboard",
		icon: <i className="fa-duotone fa-solid fa-house-window nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Summary",
				to: "/parent",
			},
			{
				component: CNavItem,
				name: "Messages",
				to: "/parent/chat",
			},
		],
	},
	{
		component: CNavItem,
		name: "Student Performance",
		to: "/parent/academics",
		icon: <i className="fa-regular fa-chart-user nav-icon"></i>,
	},
	{
		component: CNavItem,
		name: "Messages",
		to: "/parent/chat",
		icon: <i className="fa-solid fa-comment nav-icon"></i>,
	},
	{
		component: CNavItem,
		name: "Attendance",
		to: "/parent/attendance",
		icon: <i className="fa-regular fa-calendar-circle-user nav-icon"></i>,
	},
	{
		component: CNavItem,
		name: "Fees and Invoice",
		to: "/parent/finance",
		icon: <i className="fa-solid fa-wallet nav-icon"></i>,
	},

	{
		component: CNavItem,
		name: "Settings",
		to: "/parent/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
];

export default parentNav;
