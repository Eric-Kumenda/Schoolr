import React from "react";
import { CNavGroup, CNavItem } from "@coreui/react";

const studentNav = [
	{
		component: CNavGroup,
		name: "Dashboard",
		icon: <i className="fa-duotone fa-solid fa-house-window nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Summary",
				to: "/student",
			},
		],
	},
	{
		component: CNavItem,
		name: "Messages",
		to: "/student/chat",
		icon: <i className="fa-solid fa-comment nav-icon"></i>,
	},
	{
		component: CNavItem,
		name: "Fees Balance",
		to: "/student/finance",
		icon: <i className="fa-solid fa-wallet nav-icon"></i>,
	},
	
	{
		component: CNavItem,
		name: "Settings",
		to: "/student/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
];

export default studentNav;
