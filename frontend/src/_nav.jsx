import React from "react";
import CIcon from "@coreui/icons-react";
import {
	cilApplications,
	cilBell,
	cilCalculator,
	cilChartPie,
	cilCursor,
	cilDescription,
	cilDrop,
	cilExternalLink,
	cilNotes,
	cilPencil,
	cilPuzzle,
	cilSpeedometer,
	cilStar,
} from "@coreui/icons";
import { CNavGroup, CNavItem, CNavTitle } from "@coreui/react";

const _nav = [
	{
		component: CNavGroup,
		name: "Dashboard",
		icon: <i className="fa-duotone fa-solid fa-house-window nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Summary",
				to: "/dashboard",
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
		name: "Staff",
		icon: <i className="fa-duotone fa-light fa-users-line nav-icon"></i>,
		items: [
			{
				component: CNavItem,
				name: "Teachers",
				to: "/notifications/alerts",
			},
			{
				component: CNavItem,
				name: "Non-Teaching",
				to: "/notifications/badges",
			},
			{
				component: CNavItem,
				name: "Profile",
				to: "/notifications/modals",
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
	/*{
		component: CNavGroup,
		name: "Events",
		icon: <i className="fa-regular fa-calendar-lines nav-icon"></i>,
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
	},*/

	{
		component: CNavItem,
		name: "Settings",
		to: "/settings",
		icon: <i className="fa-regular fa-gear nav-icon"></i>,
	},
	/*{
		component: CNavGroup,
		name: "Settings",
		icon: <i className="fa-light fa-gear nav-icon"></i>,
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
	},*/
	/*{
		component: CNavItem,
		name: "Dashboard",
		to: "/dashboard",
		icon: <CIcon icon={cilApplications} customClassName="nav-icon" />,
		badge: {
			color: "info",
			text: "NEW",
		},
	},
	{
		component: CNavTitle,
		name: "Theme",
	},
	{
		component: CNavItem,
		name: "Colors",
		to: "/theme/colors",
		icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
	},
	{
		component: CNavItem,
		name: "Typography",
		to: "/theme/typography",
		icon: <CIcon icon={cilPencil} customClassName="nav-icon" />,
	},
	{
		component: CNavTitle,
		name: "Components",
	},
	{
		component: CNavGroup,
		name: "Base",
		to: "/base",
		icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
		items: [
			{
				component: CNavItem,
				name: "Accordion",
				to: "/base/accordion",
			},
			{
				component: CNavItem,
				name: "Breadcrumb",
				to: "/base/breadcrumbs",
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Calendar"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/components/calendar/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: "Cards",
				to: "/base/cards",
			},
			{
				component: CNavItem,
				name: "Carousel",
				to: "/base/carousels",
			},
			{
				component: CNavItem,
				name: "Collapse",
				to: "/base/collapses",
			},
			{
				component: CNavItem,
				name: "List group",
				to: "/base/list-groups",
			},
			{
				component: CNavItem,
				name: "Navs & Tabs",
				to: "/base/navs",
			},
			{
				component: CNavItem,
				name: "Pagination",
				to: "/base/paginations",
			},
			{
				component: CNavItem,
				name: "Placeholders",
				to: "/base/placeholders",
			},
			{
				component: CNavItem,
				name: "Popovers",
				to: "/base/popovers",
			},
			{
				component: CNavItem,
				name: "Progress",
				to: "/base/progress",
			},
			{
				component: CNavItem,
				name: "Smart Pagination",
				href: "https://coreui.io/react/docs/components/smart-pagination/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Smart Table"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/components/smart-table/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: "Spinners",
				to: "/base/spinners",
			},
			{
				component: CNavItem,
				name: "Tables",
				to: "/base/tables",
			},
			{
				component: CNavItem,
				name: "Tabs",
				to: "/base/tabs",
			},
			{
				component: CNavItem,
				name: "Tooltips",
				to: "/base/tooltips",
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Virtual Scroller"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/components/virtual-scroller/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
		],
	},
	{
		component: CNavGroup,
		name: "Buttons",
		to: "/buttons",
		icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
		items: [
			{
				component: CNavItem,
				name: "Buttons",
				to: "/buttons/buttons",
			},
			{
				component: CNavItem,
				name: "Buttons groups",
				to: "/buttons/button-groups",
			},
			{
				component: CNavItem,
				name: "Dropdowns",
				to: "/buttons/dropdowns",
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Loading Button"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/components/loading-button/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
		],
	},
	{
		component: CNavGroup,
		name: "Forms",
		icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
		items: [
			{
				component: CNavItem,
				name: "Form Control",
				to: "/forms/form-control",
			},
			{
				component: CNavItem,
				name: "Select",
				to: "/forms/select",
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Multi Select"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/forms/multi-select/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: "Checks & Radios",
				to: "/forms/checks-radios",
			},
			{
				component: CNavItem,
				name: "Range",
				to: "/forms/range",
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Range Slider"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/forms/range-slider/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Rating"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/forms/rating/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: "Input Group",
				to: "/forms/input-group",
			},
			{
				component: CNavItem,
				name: "Floating Labels",
				to: "/forms/floating-labels",
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Date Picker"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/forms/date-picker/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: "Date Range Picker",
				href: "https://coreui.io/react/docs/forms/date-range-picker/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: (
					<React.Fragment>
						{"Time Picker"}
						<CIcon
							icon={cilExternalLink}
							size="sm"
							className="ms-2"
						/>
					</React.Fragment>
				),
				href: "https://coreui.io/react/docs/forms/time-picker/",
				badge: {
					color: "danger",
					text: "PRO",
				},
			},
			{
				component: CNavItem,
				name: "Layout",
				to: "/forms/layout",
			},
			{
				component: CNavItem,
				name: "Validation",
				to: "/forms/validation",
			},
		],
	},
	{
		component: CNavItem,
		name: "Charts",
		to: "/charts",
		icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
	},
	{
		component: CNavGroup,
		name: "Icons",
		icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
		items: [
			{
				component: CNavItem,
				name: "CoreUI Free",
				to: "/icons/coreui-icons",
			},
			{
				component: CNavItem,
				name: "CoreUI Flags",
				to: "/icons/flags",
			},
			{
				component: CNavItem,
				name: "CoreUI Brands",
				to: "/icons/brands",
			},
		],
	},
	{
		component: CNavGroup,
		name: "Notifications",
		icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
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
		component: CNavItem,
		name: "Widgets",
		to: "/widgets",
		icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
		badge: {
			color: "info",
			text: "NEW",
		},
	},
	{
		component: CNavTitle,
		name: "Extras",
	},
	{
		component: CNavGroup,
		name: "Pages",
		icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
		items: [
			{
				component: CNavItem,
				name: "Login",
				to: "/login",
			},
			{
				component: CNavItem,
				name: "Register",
				to: "/register",
			},
			{
				component: CNavItem,
				name: "Error 404",
				to: "/404",
			},
			{
				component: CNavItem,
				name: "Error 500",
				to: "/500",
			},
		],
	},*/
	{
		component: CNavItem,
		name: "Login",
		to: '/loginStudent',
		icon: <i className="fa-regular fa-user-unlock nav-icon"></i>,
	},
];

export default _nav;
