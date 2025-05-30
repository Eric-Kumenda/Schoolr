import React from "react";
import { CNavGroup, CNavItem } from "@coreui/react";

const financeNav = [
	{
		component: CNavGroup,
		name: "Dashboard",
		icon: <i className="fa-duotone fa-solid fa-house-window nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Summary",
				to: "/finance",
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
				to: "/finance/school/profile",
			},
			{
				component: CNavItem,
				name: "Billing",
				to: "/finance/school/billing",
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
				to: "/finance/students/list",
			},
			{
				component: CNavItem,
				name: "Classes",
				to: "/finance/students/classes",
			},
			{
				component: CNavItem,
				name: "Profile",
				to: "/finance/students/profile",
			},
		],
	},
	{
		component: CNavItem,
		name: "Record Payments",
		to: "/finance/record",
		icon: <i className="fa-regular fa-money-check-dollar-pen nav-icon"></i>,
	},
	{
		component: CNavItem,
		name: "Messages",
		to: "/finance/chat",
		icon: <i className="fa-solid fa-comment nav-icon"></i>,
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
				name: "Billings",
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
		component: CNavItem,
		name: "Settings",
		to: "/finance/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
];

export default financeNav;
