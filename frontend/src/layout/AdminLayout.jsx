import React, { useEffect } from "react";
import {
	AppContent,
	AppSidebar,
	AppFooter,
	AppHeader,
} from "../components/index";
import adminRoutes from "../routes/adminRoutes";
import { useDispatch, useSelector } from "react-redux";
import socket from "../socket";
import { fetchConversations } from "../store/chatSlice";

const AdminLayout = () => {
	const dispatch = useDispatch();
	const userId = useSelector((state) => state.auth.userId);
	const role = useSelector((state) => state.auth.role);

	useEffect(() => {
		const conversationsFetch = async () => {
			await dispatch(fetchConversations(userId));
		};
		conversationsFetch();
	}, [dispatch]);
	const conversations = useSelector((state) => state.chat.conversations);

	useEffect(() => {
		// Emit that the user is online when the component is mounted
		if (userId && role && conversations.length > 0) {
			const contactIds = conversations
				.flatMap((c) => c.members?.map((u) => u.id))
				.filter((id) => id !== userId);

			socket.connect();
			socket.on("connect", () => {
				console.log("Connected to socket server");
			});
			socket.emit("user-online", { userId, contacts: contactIds });
		} else {
			return () => {
				socket.off("user-status");
				socket.disconnect();
			};
		}
	}, [userId, conversations]);
	return (
		<>
			<AppSidebar />
			<div className="wrapper d-flex flex-column min-vh-100">
				<AppHeader routes={adminRoutes} />
				<div className="body flex-grow-1">
					<AppContent routes={adminRoutes} />
				</div>
				<AppFooter />
			</div>
		</>
	);
};

export default AdminLayout;
