import React from "react";
import {
	CAvatar,
	CBadge,
	CDropdown,
	CDropdownDivider,
	CDropdownHeader,
	CDropdownItem,
	CDropdownMenu,
	CDropdownToggle,
} from "@coreui/react";
import {
	cilBell,
	cilCreditCard,
	cilCommentSquare,
	cilEnvelopeOpen,
	cilFile,
	cilLockLocked,
	cilSettings,
	cilTask,
	cilUser,
} from "@coreui/icons";
import CIcon from "@coreui/icons-react";

import avatar from "./../../assets/images/avatars/avatar.png";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";
import socket from "../../socket";
import { addToast } from "../../store/toastSlice";
import { Link } from "react-router-dom";

const AppHeaderDropdown = () => {
	const dispatch = useDispatch();
	const firstName = useSelector((state) => state.auth.first_name);
	const lastName = useSelector((state) => state.auth.last_name);
	const userRole = useSelector((state) => state.auth.role);

	const handleLogout = () => {
		socket.disconnect();
		dispatch(logout());
		dispatch(
			addToast({
				id: Date.now(),
				message: "Sign Out Successful",
				title: "Info",
				color: "#39f",
				timestamp: Date.now(),
			})
		);
	};
	return (
		<CDropdown variant="nav-item">
			<CDropdownToggle
				placement="bottom-end"
				className="py-0 px-3 rounded shadow-sm border-0 border-body-tertiary"
				caret={false}>
				<div className="row gx-0">
					<div className="col me-2">
						<CAvatar src={avatar} size="md" />
					</div>
					<div className="col me-2">
						<p className="fw-bold m-0 p-0 fs-5">{firstName}</p>
						<p className="fw-light m-0 p-0 text-muted fs-6">
							{userRole}
						</p>
					</div>
					<div className="col d-flex">
						<i className="fa-solid fa-caret-down my-auto"></i>
					</div>
				</div>
			</CDropdownToggle>
			<CDropdownMenu className="pt-0" placement="bottom-end">
				<CDropdownHeader className="bg-body shadow-sm fw-semibold mb-2">
					Account
				</CDropdownHeader>
				<CDropdownItem as={Link}>
					<CIcon icon={cilBell} className="me-2" />
					Updates
					<CBadge color="info" className="ms-2"></CBadge>
				</CDropdownItem>
				<CDropdownItem as={Link} to={`/${userRole}/chat`}>
					<CIcon icon={cilEnvelopeOpen} className="me-2" />
					Messages
					<CBadge color="info" className="ms-2">
						42
					</CBadge>
				</CDropdownItem>
				<CDropdownHeader className="bg-body shadow-sm fw-semibold my-2">
					Settings
				</CDropdownHeader>
				<CDropdownItem as={Link}>
					<CIcon icon={cilUser} className="me-2" />
					Profile
				</CDropdownItem>
				<CDropdownItem as={Link}>
					<CIcon icon={cilSettings} className="me-2" />
					Settings
				</CDropdownItem>
				<CDropdownDivider />
				<CDropdownItem onClick={handleLogout}>
					<i className="fa-solid fa-right-from-bracket"></i>
					<span className="ms-2">Logout</span>
				</CDropdownItem>
			</CDropdownMenu>
		</CDropdown>
	);
};

export default AppHeaderDropdown;
