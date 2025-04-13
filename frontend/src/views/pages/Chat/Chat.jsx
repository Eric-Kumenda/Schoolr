import React, { useState, useEffect } from "react";
import {
	CInputGroup,
	CFormInput,
	CButton,
	CAvatar,
	CBadge,
	CListGroup,
	CListGroupItem,
	CTooltip,
	COffcanvas,
	COffcanvasHeader,
	COffcanvasTitle,
	COffcanvasBody,
	CCloseButton,
} from "@coreui/react";
import { formatDistanceToNow } from "date-fns";
import ChatBox from "./ChatBox";

const useWindowSize = () => {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => setWidth(window.innerWidth);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return width;
};

const Chat = () => {
	const [query, setQuery] = useState("");
	const [visible, setVisible] = useState(false);
	const width = useWindowSize();
	const isMobile = width < 768;

	const handleSelectedContact = (contact) => {
		setSelectedChat(contact);
		if (isMobile) setVisible(true);
	};
	const [selectedChat, setSelectedChat] = useState(null);
	const messages = [
		{
			sender: "other",
			text: "Hello Jenny! Looking forward to talk to you!",
			time: "2025-04-10T09:20:00",
		},
		{
			sender: "self",
			text: `Hey Cynthia! You've sent a booking request to Jenny. Soon she will get in contact with you.`,
			time: "2025-04-10T09:22:00",
		},
		{
			sender: "self",
			text: "Hello Cynthia! Your lesson request has been accepted. Waiting for our meeting.",
			time: "2025-04-10T09:25:00",
		},
		{
			sender: "other",
			text: "Hello Jenny! Looking forward to talk to you!",
			time: "2025-04-10T09:28:00",
		},
	];

	const contacts = [
		{
			userID: "Usr001",
			name: "Robert Smith",
			time: "2025-04-10T08:00:00",
			unread: true,
			onlineStatus: true,
		},
		{
			userID: "Usr002",
			name: "Esther Howard",
			time: "2025-04-10T08:00:00",
			unread: false,
			onlineStatus: false,
		},
		{
			userID: "Usr003",
			name: "Cameron Williamson",
			time: "2025-04-10T09:10:00",
			unread: true,
			onlineStatus: false,
		},
		{
			userID: "Usr004",
			name: "Annette Black",
			time: "2025-04-10T12:30:00",
			unread: false,
			onlineStatus: true,
		},
		{
			userID: "Usr005",
			name: "Darlene Robertson",
			time: "2025-04-10T08:15:00",
			unread: false,
			onlineStatus: false,
		},
		{
			userID: "Usr006",
			name: "Brooklyn Simmons",
			time: "2025-04-10T08:20:00",
			unread: false,
			onlineStatus: true,
		},
	];

	const filteredContacts = contacts.filter((contact) => {
		const q = query.toLowerCase();
		return (
			contact.name.toLowerCase().includes(q) ||
			contact.userID.toLowerCase().includes(q) // ||
			//contact.info.toLowerCase().includes(q)
		);
	});

	return (
		<div className="row">
			{/* Sidebar */}
			<div className="col col-12 col-md-4 p-3">
				<h5 className="mb-3">Inbox</h5>
				<CInputGroup className="mb-3">
					<CFormInput
						type="text"
						placeholder="Search Contacts"
						aria-label="Search Contacts"
						aria-describedby="searchClearButton"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<CButton
						type="button"
						className={query === "" ? "d-none" : ""}
						color="secondary"
						variant="outline"
						id="searchClearButton"
						onClick={() => setQuery("")}>
						<i className="fa-regular fa-close"></i>
					</CButton>
				</CInputGroup>

				<CListGroup style={{ overflowY: "auto", maxHeight: "70vh" }}>
					<p
						className="text-center my-1 text-muted"
						style={{ fontSize: "0.8rem" }}>
						{filteredContacts.length + " "}Contact
						{filteredContacts.length === 1 ? "" : "s"} found
					</p>
					{filteredContacts.map((contact, index) => (
						<CListGroupItem
							key={index}
							className={`d-flex align-items-center justify-content-between py-2 py-md-3 px-3 rounded mb-2 text-body ${
								contact.userID === selectedChat
									? "bg-body-tertiary border-1"
									: "bd-body-secondary border-0"
							}`}
							onClick={() =>
								handleSelectedContact(contact.userID)
							}>
							<div>
								<CAvatar color="warning" className="me-2">
									{contact.name.substring(0, 2)}

									<CBadge
										className="border border-light p-1"
										color={`${
											contact.onlineStatus
												? "success"
												: "secondary"
										}`}
										position="bottom-end"
										shape="rounded-circle">
										<span className="visually-hidden">
											Online Status
										</span>
									</CBadge>
								</CAvatar>
								<strong>{contact.name}</strong>
								<p
									className={`${
										contact.unread ? "" : "text-muted"
									} overflow-hidden ms-2`}
									style={{
										margin: 0,
										fontSize: "0.85rem",
									}}>
									Hello, Cynthia! Your L...
								</p>
							</div>
							<div className="text-end">
								{contact.unread && (
									<CBadge
										color="primary"
										shape="rounded-pill">
										1
									</CBadge>
								)}
								<small
									className={`d-block ${
										contact.unread ? "" : "text-muted"
									}`}>
									{formatDistanceToNow(
										new Date(contact.time),
										{
											addSuffix: true,
										}
									)}
								</small>
							</div>
						</CListGroupItem>
					))}
				</CListGroup>
			</div>

			{/* Main Chat */}
			{/* Desktop View: 2-column layout */}
			{!isMobile && selectedChat !== null ? (
				<ChatBox
					contact={contacts.find(
						(user) => user.userID === selectedChat
					)}
					messages={messages}
				/>
			) : (
				<div className="col text-center d-none d-md-block">
					Select a Contact to open Chat
				</div>
			)}

			{/* Mobile View: Show ChatBox in Offcanvas */}
			{isMobile && (
				<COffcanvas
					backdrop="static"
					placement="end"
					visible={visible}
					onHide={() => setVisible(false)}
					scroll>
					<COffcanvasHeader>
						<COffcanvasTitle>
							Chat with{" "}
							{selectedChat &&
								contacts.find((c) => c.userID === selectedChat)
									?.name}
						</COffcanvasTitle>
						<CCloseButton
							className="text-reset text-end"
							onClick={() => setVisible(false)}
						/>
					</COffcanvasHeader>
					<COffcanvasBody className="p-0">
						{selectedChat && (
							<ChatBox
								contact={contacts.find(
									(user) => user.userID === selectedChat
								)}
								messages={messages}
							/>
						)}
					</COffcanvasBody>
				</COffcanvas>
			)}

		</div>
	);
};

export default Chat;
