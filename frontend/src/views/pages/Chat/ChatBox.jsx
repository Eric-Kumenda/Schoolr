import { CAvatar, CButton, CFormInput, CInputGroup, CTooltip } from "@coreui/react";
import { formatDistanceToNow } from "date-fns";
import React from "react";

const ChatBox = ({contact, messages}) => {
	return (
		<div className={`col col-12 col-md-8 flex-grow-1 d-flex flex-column`}>
			<div className="d-flex justify-content-between align-items-center p-3 border-bottom">
				<div className="d-flex align-items-center">
					<CAvatar color="info" className="me-2">
						DR
					</CAvatar>
					<div>
						<strong>{contact.name}</strong>
						<div
							className={contact.onlineStatus?'text-success':'text-muted'}
							style={{ fontSize: "0.8rem" }}>
							{contact.onlineStatus?'Active':'Inactive'}
						</div>
					</div>
				</div>
				<div className="text-end">
					<CTooltip content="Voice Call" placement="bottom">
						<CButton className="rounded">
							<i className="fa-solid fa-phone"></i>
						</CButton>
					</CTooltip>
					<CTooltip content="Options" placement="bottom">
						<CButton className="rounded">
							<i className="fa-solid fa-ellipsis-v"></i>
						</CButton>
					</CTooltip>
				</div>
			</div>

			<div className="flex-grow-1 p-3" style={{ overflowY: "auto" }}>
				{messages.map((msg, index) => (
					<div
						key={index}
						className={`mb-3 d-flex ${
							msg.sender === "self"
								? "justify-content-end"
								: "justify-content-start"
						}`}>
						<div
							className={`p-2 px-3 rounded-4 ${
								msg.sender === "self"
									? "bg-primary-subtle"
									: "bg-body-tertiary"
							}`}>
							{msg.text}
							<br />
							<p
								className="text-muted text-end m-0"
								style={{ fontSize: "0.7rem" }}>
								{formatDistanceToNow(new Date(msg.time), {
									addSuffix: true,
								})}
							</p>
						</div>
					</div>
				))}
			</div>

			<div className="p-3 border-top">
				<CInputGroup>
					<CFormInput type="text" placeholder="Message" />
					<CTooltip content="Send" placement="top">
						<CButton color="primary" className="rounded">
							<i className="fa-solid fa-paper-plane"></i>
						</CButton>
					</CTooltip>
					<CTooltip content="Voice Note" placement="top">
						<CButton color="light" className="rounded">
							<i className="fa-solid fa-microphone"></i>
						</CButton>
					</CTooltip>
				</CInputGroup>
			</div>
		</div>
	);
};

export default ChatBox;
