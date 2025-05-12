import {
	CAvatar,
	CButton,
	CDropdown,
	CDropdownItem,
	CDropdownMenu,
	CDropdownToggle,
	CFormInput,
	CInputGroup,
	CTooltip,
} from "@coreui/react";
import "animate.css";
import { format } from "date-fns";
import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchCurrentChat,
	setCurrentOutgoingCall,
	addMessage,
	markMessagesAsRead,
	markMessagesAsReadLocally,
	fetchConversations,
} from "../../../store/chatSlice";
import FlipLoader from "../../../components/loaders/FlipLoader";
import DotLoader7 from "../../../components/loaders/DotLoader7";
import { Link } from "react-router-dom";

const ChatBox = ({ convoId, socket, isOnline }) => {
	const dispatch = useDispatch();
	const [text, setText] = useState("");
	const userId = useSelector((state) => state.auth.userId);

	const [usersInChat, setUsersInChat] = useState([]);
	const [typing, setTyping] = useState(false);
	const [typingUser, setTypingUser] = useState(null);
	const chatContainerRef = useRef(null); // Ref for the chat container
	const messageRefs = useRef([]); //Refs for messages

	useEffect(() => {
		const conversationsFetch = async () => {
			await dispatch(fetchCurrentChat(convoId));
		};
		conversationsFetch();
	}, [dispatch]);
	const currentChat = useSelector((state) => state.chat.currentChat);
	const currentChatLoading = useSelector(
		(state) => state.chat.currentChatLoading
	);
	const [currentChatMessages, setCurrentChatMessages] = useState(null);

	const otherUser = currentChat?.members.find((user) => user.id !== userId);

	// Emit typing event when user starts typing
	const handleTyping = (e) => {
		setText(e.target.value);
		if (e.target.value.trim() && !typing) {
			setTyping(true);
			// Emit to backend to notify other users in the room
			socket.emit("typing", {
				conversationId: convoId,
				userId: userId,
			});
		} else if (!e.target.value.trim() && typing) {
			setTyping(false);
			// Emit to backend to notify other users in the room that the user stopped typing
			socket.emit("stop-typing", {
				conversationId: convoId,
				userId: userId,
			});
		}
	};

	const handleSend = () => {
		if (!text.trim()) return;

		socket.emit("send_message", {
			conversation_id: convoId,
			sender: userId,
			message: text,
		});

		setText("");
		setTyping(false);
		dispatch(fetchConversations(userId));
		const newMessage = {
			sender: userId,
			message: text,
			timestamp: new Date(),
			read: false,
		};
		// Optimistically update the local state to show the message immediately
		setCurrentChatMessages((prevMessages) => [newMessage, ...prevMessages]);
		// Emit to backend to notify other users in the room that the user stopped typing
		socket.emit("stop-typing", {
			conversationId: convoId,
			userId: userId,
		});
	};

	// Listen for typing status
	useEffect(() => {
		// Emit the "join_conversation" event when the user enters the chat
		socket.emit("join_conversation", convoId);

		socket.on(
			"receive_message",
			async ({ conversation_id, newMessage }) => {
				if (conversation_id === convoId) {
					setCurrentChatMessages((prevMessages) => [
						...prevMessages,
						newMessage,
					]);
				}
			}
		);

		socket.on("user-typing", ({ typingUserId, conversationId }) => {
			if (conversationId === convoId) {
				// Set typing state to true when another user is typing
				if (typingUserId !== userId) {
					setTypingUser(typingUserId);
				}
			}
		});

		socket.on("user-stopped-typing", ({ typingUserId, conversationId }) => {
			if (conversationId === convoId) {
				// Set typing state to false when another user stops typing
				if (typingUserId !== userId) {
					setTypingUser(false);
				}
			}
		});

		// Listen for when the other user joins the conversation
		socket.on("user-in-chat", (data) => {
			// Listen for other users in the chat
			socket.on("user-in-chat", (userId) => {
				// Add the user to your state that tracks users in the chat
				if (!usersInChat.includes(userId)) {
					setUsersInChat((prev) => [...prev, userId]);
				}
			});
		});

		socket.on("user-left", (userId) => {
			setUsersInChat((prev) => prev.filter((id) => id !== userId));
		});

		// Clean up when moving to another conversation
		return () => {
			// Emit a leave event for the previous conversation
			socket.emit("leave_conversation", convoId);
			socket.off("receive_message");

			socket.off("user-typing");
			socket.off("user-stopped-typing");
			socket.off("user-in-chat");
		};
	}, [convoId]);

	const getOtherUserName = () => {
		if (currentChat?.is_group) return currentChat.group_name;

		// Find user who is not the current user
		const otherUser = currentChat?.members.find(
			(user) => user.id !== userId
		);
		return otherUser
			? `${otherUser.first_name} ${otherUser.last_name}`
			: "Unknown User";
	};

	useEffect(() => {
		if (currentChat) {
			setCurrentChatMessages(currentChat.messages.slice().reverse());
		}
	}, [currentChat]);
	useEffect(() => {
		// Scroll to the bottom whenever the messages array changes
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop =
				chatContainerRef.current.scrollHeight;
		}
	}, [currentChatMessages]);

	const markAsReadHandler = useCallback(
		(entries) => {
			const unreadMessageIdsInView = [];
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const messageId = entry.target.dataset.messageId;
					const message = currentChatMessages.find(
						(msg) =>
							msg._id === messageId &&
							!msg.read &&
							msg.sender !== userId
					); // Example: Assuming messages have an _id and 'read' property
					if (message) {
						unreadMessageIdsInView.push(message._id);
						console.log(message._id);
					}
				}
			});

			if (unreadMessageIdsInView.length > 0) {
				dispatch(
					markMessagesAsRead({
						convoId,
						messageIds: unreadMessageIdsInView,
						userId,
					})
				);
				// Optimistically update local state to avoid re-fetching immediately
				/*setCurrentChatMessages((prevMessages) =>
					prevMessages.map((msg) =>
						unreadMessageIdsInView.includes(msg._id)
							? { ...msg, read: true }
							: msg
					)
				);*/
				// Optimistically update local state
				dispatch(
					markMessagesAsReadLocally({
						convoId,
						messageIds: unreadMessageIdsInView,
					})
				);
			}
		},
		[dispatch, convoId, currentChatMessages, userId]
	);

	useEffect(() => {
		if (messageRefs.current) {
			//messageRefs.current = Array(currentChatMessages?.length).fill(null); // Reset refs on message update
			const observer = new IntersectionObserver(markAsReadHandler, {
				root: chatContainerRef.current,
				threshold: 0.1, // Adjust as needed (e.g., 10% of the message visible)
			});

			messageRefs.current.forEach((ref, index) => {
				if (ref) {
					observer.observe(ref);
				}
			});

			return () => observer.disconnect(); // Cleanup the observer
		}
	}, [currentChatMessages, markAsReadHandler]);

	const initiateCall = (callType) => {
		const otherUser = currentChat?.members.find(
			(user) => user.id !== userId
		);
		if (otherUser) {
			socket.emit("call-user", {
				recipient: otherUser.id,
				caller: userId,
				conversationId: convoId,
				type: callType,
			});
			dispatch(
				setCurrentOutgoingCall({
					type: callType,
					caller: userId,
					conversationId: convoId,
					status: "calling",
				})
			);
			// The CallHandler component handles the WebRTC connection
		}
	};

	return (
		<div className="col col-12 col-md-8 flex-grow-1 d-flex flex-column h-100">
			{/* Header */}
			<div className="d-flex justify-content-between align-items-center p-3 border-bottom">
				<div className="d-flex align-items-center">
					<CAvatar color="info" className="me-2">
						{getOtherUserName().substring(0, 2).toUpperCase()}
					</CAvatar>
					<div>
						<strong>{getOtherUserName()}</strong>
						<div
							className={isOnline ? "text-success" : "text-muted"}
							style={{ fontSize: "0.8rem" }}>
							{isOnline ? "Active" : "Inactive"}
						</div>
					</div>
				</div>
				<div className="d-flex align-items-center">
					<CTooltip content="Voice Call" placement="bottom">
						<button
							className="btn bg-body border border-body-tertiary rounded-5 ms-2 d-flex align-items-center shadow-sm"
							onClick={() => initiateCall("audio")}>
							<i className="fa-solid fa-phone"></i>
						</button>
					</CTooltip>
					<CTooltip content="Video Call" placement="bottom">
						<button
							className="btn bg-body border border-body-tertiary rounded-5 ms-2 d-flex align-items-center shadow-sm"
							onClick={() => initiateCall("video")}>
							<i className="fa-solid fa-video"></i>
						</button>
					</CTooltip>
					<CDropdown>
						<CDropdownToggle
							className="btn bg-body border border-body-tertiary rounded-5 ms-2 d-flex align-items-center shadow-sm"
							caret={false}>
							<i className="fa-solid fa-ellipsis-vertical"></i>
						</CDropdownToggle>
						<CDropdownMenu>
							<CDropdownItem href="#">Action</CDropdownItem>
							<CDropdownItem href="#">
								Another action
							</CDropdownItem>
							<CDropdownItem href="#">
								Something else here
							</CDropdownItem>
						</CDropdownMenu>
					</CDropdown>
				</div>
			</div>
			{/* Messages */}
			<div
				className="flex-grow-1 p-3 position-relative"
				ref={chatContainerRef}
				style={{ overflowY: "auto", maxHeight: "70vh" }}>
				{currentChatLoading === "succeeded" ? (
					currentChatMessages &&
					currentChatMessages.map((msg, index) => (
						<div
							key={msg._id}
							ref={(el) => {
								messageRefs.current[index] = el;
							}}
							className={`mb-3 d-flex ${
								msg.sender === userId
									? "justify-content-end"
									: "justify-content-start"
							}`}
							data-message-id={msg._id}>
							<div
								className={`p-2 px-3 rounded-4 ${
									msg.sender === userId
										? "bg-primary-subtle"
										: "bg-body-tertiary"
								}`}>
								{msg.message}
								<p
									className="text-muted text-end m-0"
									style={{ fontSize: "0.7rem" }}>
									{format(new Date(msg.timestamp), "HH:mm")}{" "}
									{msg.sender === userId ? (
										msg.read ? (
											<i className="fa-regular fa-check-double text-info fs-5"></i>
										) : (
											<i className="fa-regular fa-check text-secondary fs-5"></i>
										)
									) : null}
								</p>
							</div>
						</div>
					))
				) : currentChatLoading === "pending" ? (
					<div className="pt-3 d-flex justify-content-center">
						<FlipLoader />
					</div>
				) : (
					<div className="pt-3 text-center">
						<p>Connection to server failed</p>
					</div>
				)}
			</div>
			{/* Send Message */}
			<div className="p-2 border-top position-relative">
				<div
					className="position-absolute d-flex align-items-center justify-content-start mt-1 ms-2"
					style={{ top: "-25px" }}>
					{/* Typing Indicator */}
					{typingUser && usersInChat.includes(otherUser?.id) && (
						<CTooltip content="Typing" placement="bottom">
							<span className="bg-body-secondary rounded px-2 py-1 me-2">
								<DotLoader7 />
							</span>
						</CTooltip>
					)}
					{usersInChat.includes(otherUser?.id) && (
						<CTooltip
							content={`${otherUser.first_name} in Chat`}
							placement="bottom">
							<span className="my-0 animate__animated animate__backInUp">
								<i className="fa-duotone fa-solid fa-user-visor"></i>
								{/*otherUser.first_name*/}
							</span>
						</CTooltip>
					)}
				</div>
				<CInputGroup>
					<CFormInput
						type="text"
						placeholder="Message"
						value={text}
						onChange={(e) => {
							handleTyping(e);
						}}
						onKeyDown={(e) => e.key === "Enter" && handleSend()}
					/>
					<CTooltip content="Send" placement="top">
						<CButton
							color="primary"
							className="rounded"
							onClick={handleSend}>
							<i className="fa-solid fa-paper-plane"></i>
						</CButton>
					</CTooltip>
				</CInputGroup>
			</div>
		</div>
	);
};

export default ChatBox;
