import React, { useState, useEffect } from "react";
import {
	CInputGroup,
	CFormInput,
	CButton,
	CAvatar,
	CBadge,
	CListGroup,
	CListGroupItem,
	COffcanvas,
	COffcanvasHeader,
	COffcanvasTitle,
	COffcanvasBody,
	CCloseButton,
} from "@coreui/react";
import { formatDistanceToNow } from "date-fns";
import ChatBox from "./ChatBox";
import socket from "../../../socket";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations } from "../../../store/chatSlice";
import FlipLoader from "../../../components/loaders/FlipLoader";

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
	const dispatch = useDispatch();
	const [query, setQuery] = useState("");
	const [visible, setVisible] = useState(false);
	const width = useWindowSize();
	const isMobile = width < 768;
	const userId = useSelector((state) => state.auth.userId);
	const [selectedChat, setSelectedChat] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState({});
	const [isOtherUserOnline, setIsOtherUserOnline] = useState();

	const handleSelectedContact = (convo) => {
		setSelectedChat(null);
		setSelectedChat(convo);
		if (isMobile) setVisible(true);
	};

	useEffect(() => {
		const conversationsFetch = async () => {
			await dispatch(fetchConversations(userId));
		};
		conversationsFetch();
	}, [dispatch]);
	const conversations = useSelector((state) => state.chat.conversations);
	const convoFetchStatus = useSelector((state) => state.chat.loading);

	const filteredContacts = conversations.filter((convo) => {
		const q = query.toLowerCase();
		return convo;
		//convo.members.first_name.toLowerCase().includes(q) ||
		//convo.members.last_name.toLowerCase().includes(q) //||
		//contact.info.toLowerCase().includes(q)
	});

	useEffect(() => {
		if (userId && conversations.length > 0) {
			const contactIds = conversations
				.flatMap((c) => c.members.map((u) => u.id))
				.filter((id) => id !== userId);

			// Ask server for online statuses
			socket.emit("get-online-status", contactIds);

			socket.on("online-status-response", (onlineList) => {
				const onlineMap = {};
				onlineList.forEach((id) => (onlineMap[id] = true));
				setOnlineUsers(onlineMap);
			});

			socket.on("user-status", ({ userId, online }) => {
				setOnlineUsers((prev) => {
					const updatedUsers = { ...prev };

					if (online) {
						updatedUsers[userId] = true; // Add or keep user as online
					} else {
						delete updatedUsers[userId]; // Remove user from the map if they are offline
					}

					return updatedUsers;
				});
			});

			return () => {
				socket.off("user-status");
				socket.off("online-status-response");
			};
		}
	}, [userId, conversations]);

	//Check online status to pass to ChatBox
	useEffect(() => {
		if (selectedChat) {
			const otherUser = conversations
				.find((convo) => convo.conversation_id === selectedChat)
				?.members.find((user) => user.id !== userId); // Find the other user

			if (otherUser) {
				const isOtherUserOnline = onlineUsers[otherUser.id]
					? true
					: false; // Check if they're online
				setIsOtherUserOnline(isOtherUserOnline); // Save this status to a state
			}
		}
	}, [selectedChat, onlineUsers, conversations, userId]);
	/*socket.on("new-message", (data) => {
			// handle real-time incoming message (update UI if necessary)
			if (data.conversation_id === selectedChat?.conversation_id) {
				setSelectedMessages((prev) => [...prev, data.message]);
			}
		});*/

	const [selectedMessages, setSelectedMessages] = useState([]);
	const [page, setPage] = useState(1);
	const MESSAGES_PER_PAGE = 10;

	// Simulated messages fetching (replace with API call)
	const fetchMessages = (conversation) => {
		const allMessages = conversation.messages || [];
		const pagedMessages = allMessages.slice(-page * MESSAGES_PER_PAGE);
		setSelectedMessages(pagedMessages);
	};

	useEffect(() => {
		if (selectedChat) {
			fetchMessages(selectedChat);
		}
	}, [selectedChat, page]);
	// Step 1: Sort the conversations by the most recent message timestamp
	const sortedConversations = [...conversations]?.sort((a, b) => {
		const getLastMessageTimestamp = (convo) => {
			const unreadMessages = convo.messages.filter(
				(msg) => msg.sender !== userId && msg.read === false
			);
			if (unreadMessages.length > 0) {
				return unreadMessages[unreadMessages.length - 1].timestamp;
			} else if (convo.messages.length > 0) {
				return convo.messages[convo.messages.length - 1].timestamp;
			} else {
				return null; // If no messages are found, return null
			}
		};

		const lastMessageA = getLastMessageTimestamp(a);
		const lastMessageB = getLastMessageTimestamp(b);

		// Compare timestamps
		if (!lastMessageA) return 1; // If no message for A, place it later
		if (!lastMessageB) return -1; // If no message for B, place it later

		return new Date(lastMessageB) - new Date(lastMessageA); // Sort descending (most recent first)
	});

	return (
		<div className="row overflow-y-scroll h-100">
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
					{convoFetchStatus === "succeeded" ? (
						sortedConversations.map((convo, index) => {
							// Step 1: Determine the most recent message and unread status
							let lastMessage = "";
							let unreadCount = 0;
							let lastMessageTimestamp = null;

							// Find unread messages and the most recent message
							const unreadMessages = convo.messages.filter(
								(msg) =>
									msg.sender !== userId && msg.read === false
							);
							if (unreadMessages.length > 0) {
								// If there are unread messages, use the most recent one
								lastMessage =
									unreadMessages[unreadMessages.length - 1]
										.message;

								lastMessageTimestamp =
									unreadMessages[unreadMessages.length - 1]
										.timestamp;
								unreadCount = unreadMessages.length;
							} else if (convo.messages.length > 0) {
								// If no unread messages, use the most recent message in the array
								lastMessage =
									convo.messages[convo.messages.length - 1]
										.message;
								lastMessageTimestamp =
									convo.messages[convo.messages.length - 1]
										.timestamp;
							} else {
								// Fallback if no messages are present
								lastMessage = "No messages yet.";
							}

							// Step 2: Determine the other user (or group name if it's a group chat)
							let contactName = "";
							let contactInitials = "";
							if (convo.is_group) {
								// Show the group name if it's a group chat
								contactName = convo.group_name || "Group Chat"; // Default if no group name is provided
							} else {
								// Show the name of the user who is not the current user
								// Assuming you've already enriched the contact with user details (first_name, last_name)
								const otherUser = convo.members.find(
									(user) => user.id !== userId
								);

								if (otherUser) {
									contactName = `${otherUser.first_name} ${otherUser.last_name}`;
									contactInitials = `${otherUser.first_name.substring(
										0,
										1
									)}${otherUser.last_name.substring(0, 1)}`;
								} else {
									contactName = "Unknown User"; // Fallback in case user info isn't available
								}
							}

							// Step 3: Format the timestamp
							const timeAgo = lastMessageTimestamp
								? formatDistanceToNow(
										new Date(lastMessageTimestamp),
										{ addSuffix: true }
								  )
								: "";
							const otherUserId = convo.members.find(
								(u) => u.id !== userId
							)?.id;

							return (
								<CListGroupItem
									key={index}
									className={`d-flex align-items-center justify-content-between py-2 py-md-3 px-3 rounded mb-2 text-body shadow-sm ${
										convo.conversation_id === selectedChat
											? "bg-body-tertiary border-1"
											: "bd-body-secondary border-0"
									}`}
									onClick={() =>
										handleSelectedContact(
											convo.conversation_id
										)
									}>
									<div>
										<CAvatar
											color="secondary"
											className="me-2">
											{contactInitials}
											<CBadge
												className="border border-light p-1"
												color={
													onlineUsers[otherUserId]
														? "success"
														: "secondary"
												}
												position="bottom-end"
												shape="rounded-circle">
												<span className="visually-hidden">
													Online Status
												</span>
											</CBadge>
										</CAvatar>
										<strong>{contactName}</strong>{" "}
										{/* display either the other user's name or the group name */}
										<p
											className={`${
												unreadCount > 0
													? ""
													: "text-muted"
											} overflow-hidden ms-2`}
											style={{
												margin: 0,
												fontSize: "0.85rem",
											}}>
											{lastMessage}{" "}
											{/* Display most recent message */}
										</p>
									</div>
									<div className="text-end">
										{unreadCount > 0 && (
											<CBadge
												color="primary"
												shape="rounded-pill">
												{unreadCount}{" "}
												{/* Display the number of unread messages */}
											</CBadge>
										)}
										<small
											className={`d-block ${
												unreadCount > 0
													? ""
													: "text-muted"
											}`}>
											{timeAgo}{" "}
											{/* Display time since last message */}
										</small>
									</div>
								</CListGroupItem>
							);
						})
					) : convoFetchStatus === "pending" ? (
						<div className="pt-3 text-center">
							<FlipLoader />
						</div>
					) : (
						<div className="pt-3 text-center">
							<p>Connection to server failed</p>
						</div>
					)}
				</CListGroup>
			</div>

			{/* Main Chat */}
			{/* Desktop View: 2-column layout */}
			{!isMobile && selectedChat !== null ? (
				<ChatBox
					convoId={selectedChat}
					key={selectedChat}
					socket={socket}
					isOnline={isOtherUserOnline}
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
							<strong>
								{selectedChat &&
									conversations
										.find(
											(c) =>
												c.conversation_id ===
												selectedChat
										)
										?.members?.find(
											(user) => user.id !== userId
										).first_name +
										" " +
										conversations
											.find(
												(c) =>
													c.conversation_id ===
													selectedChat
											)
											?.members?.find(
												(user) => user.id !== userId
											).last_name}
							</strong>
						</COffcanvasTitle>
						<CCloseButton
							className="text-reset text-end"
							onClick={() => {
								setVisible(false);
								setSelectedChat(null);
							}}
						/>
					</COffcanvasHeader>
					<COffcanvasBody className="p-0">
						{selectedChat && (
							<ChatBox
								convoId={selectedChat}
								key={selectedChat}
								socket={socket}
								isOnline={isOtherUserOnline}
							/>
						)}
					</COffcanvasBody>
				</COffcanvas>
			)}
		</div>
	);
};

export default Chat;
