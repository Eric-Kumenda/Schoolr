require("dotenv").config();
const fs = require("fs");
const express = require("express");
const https = require("https");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const connectDB = require("./config/db");
const Chat = require("./models/Chat");

require("./controllers/authController"); // where passport config lives

const app = express();
const port = 5000;
const server = https.createServer(
	{
		key: fs.readFileSync("cert/localhost+2-key.pem"),
		cert: fs.readFileSync("cert/localhost+2-fullchain.pem"),
	},
	app
);
const io = new Server(server, {
	cors: {
		origin: [
			"https://localhost:5173",
			"https://0.0.0.0:5173",
			"https://192.168.100.11",
			"https://192.168.100.11:5173",
		],
		methods: ["GET", "POST"],
	},
});

connectDB();

// CORS Config
const allowedOrigins = [
	"https://localhost:5173",
	"https://localhost",
	"https://192.168.100.11",
	"https://192.168.100.11:5173",
];
const corsOptions = {
	origin: allowedOrigins,
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true,
};

app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (allowedOrigins.includes(origin)) {
		res.header("Access-Control-Allow-Origin", origin);
		res.header("Access-Control-Allow-Credentials", "true");
	}
	next();
});
app.use(express.json());
app.use(cors(corsOptions));
//app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(passport.initialize());

const authRoutes = require("./routes/authRoutes");
const schoolRoutes = require("./routes/schoolRoutes");
const linkRoutes = require("./routes/linkRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/link", linkRoutes);
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

const activeUsers = new Map(); // store users & their socket ids

// A helper function to get members of a conversation
async function getConversationMembers(conversationId) {
	try {
		const chat = await Chat.findOne({
			conversation_id: conversationId,
		});
		if (!chat) {
			console.error(
				`Chat not found for conversationId: ${conversationId}`
			);
			return []; // Return empty array if no chat is found
		}
		return chat.members || []; // Ensure this always returns an array
	} catch (error) {
		console.error(
			`Error fetching members for conversationId: ${conversationId}`,
			error
		);
		return []; // Return empty array in case of an error
	}
}
io.on("connection", (socket) => {
	//console.log("User connected:", socket.id);

	socket.on("user-online", ({ userId, contacts }) => {
		activeUsers.set(userId, socket.id);
		socket.contacts = contacts; // Save for later use
		socket.userId = userId;

		// Notify only the online contacts (if they care)
		contacts?.forEach((contactId) => {
			const contactSocketId = activeUsers.get(contactId);
			if (contactSocketId) {
				io.to(contactSocketId).emit("user-status", {
					userId,
					online: true,
				});
			}
		});
	});

	socket.on("get-online-status", (contactIds) => {
		// Only return the contactIds that are in activeUsers
		const onlineContacts = contactIds.filter((id) => activeUsers.has(id));
		socket.emit("online-status-response", onlineContacts);
	});

	socket.on("join_conversation", (conversationId) => {
		// Join the room corresponding to the conversationId
		socket.join(conversationId);

		// Emit to all users in the room that the current user has joined
		socket.to(conversationId).emit("user-in-chat", socket.userId);

		// Emit to the current user the list of people already in the room
		const usersInRoom = io.sockets.adapter.rooms.get(conversationId);
		if (usersInRoom) {
			usersInRoom.forEach((socketId) => {
				const userSocket = io.sockets.sockets.get(socketId);
				if (userSocket && userSocket.userId !== socket.userId) {
					socket.emit("user-in-chat", userSocket.userId);
				}
			});
		}
	});
	socket.on("leave_conversation", (conversationId) => {
		// Leave the room for the current conversation
		socket.leave(conversationId);

		// Emit to the room that the user has left the conversation
		socket.to(conversationId).emit("user-left", socket.userId);
	});

	// Emit typing event when a user starts typing in a conversation
	socket.on("typing", ({ conversationId, userId }) => {
		// Join the room for the conversation
		socket.join(conversationId);
		const typingUserId = userId;

		// Emit to all other users in the conversation except the one typing
		socket
			.to(conversationId)
			.emit("user-typing", { typingUserId, conversationId });
	});

	// Emit when a user stops typing (this can be implemented by using a timeout or other checks)
	socket.on("stop-typing", ({ conversationId, userId }) => {
		const typingUserId = userId;
		socket
			.to(conversationId)
			.emit("user-stopped-typing", { typingUserId, conversationId });
	});

	socket.on("send_message", async ({ conversation_id, sender, message }) => {
		const chat = await Chat.findOne({ conversation_id: conversation_id });
		if (!chat) return console.log("Chat not found");

		const newMessage = {
			sender,
			message,
			timestamp: new Date(),
			read: false,
		};

		chat.messages.push(newMessage);
		chat.total_messages += 1;
		await chat.save();

		socket.to(conversation_id).emit("receive_message", {
			conversation_id,
			newMessage: newMessage,
		});
	});

	// WebRTC Signaling Logic
	socket.on("call-user", ({ recipient, caller, conversationId, type }) => {
		const recipientSocketId = activeUsers.get(recipient);
		const callerSocketId = activeUsers.get(caller);

		// You might want to fetch the caller's name from your database here
		// and include it in the emitted event.
		const callerName = caller; // Placeholder - replace with actual name retrieval

		if (recipientSocketId) {
			io.to(recipientSocketId).emit("incoming-call", {
				caller,
				type,
				conversationId,
				callerName,
			});
		} else {
			// Optionally notify the caller if the recipient is offline
			io.to(callerSocketId).emit("call-rejected", {
				reason: "Recipient is offline",
				conversationId,
			});
		}
	});

	socket.on("offer", ({ sdp, recipient, caller, conversationId, type }) => {
		const recipientSocketId = activeUsers.get(recipient);
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("offer", {
				sdp,
				caller,
				conversationId,
				type,
			});
		}
	});

	socket.on("answer", ({ sdp, recipient, caller, conversationId }) => {
		const recipientSocketId = activeUsers.get(recipient);
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("answer", {
				sdp,
				caller,
				conversationId,
			});
		}
	});

	socket.on(
		"ice-candidate",
		({ candidate, recipient, caller, conversationId }) => {
			const recipientSocketId = activeUsers.get(recipient);
			if (recipientSocketId) {
				io.to(recipientSocketId).emit("ice-candidate", {
					candidate,
					caller,
					conversationId,
				});
			}
		}
	);

	socket.on("call-accepted", ({ recipient, conversationId }) => {
		const recipientSocketId = activeUsers.get(recipient);
		io.to(recipientSocketId).emit("call-accepted", { conversationId });
	});

	socket.on("call-rejected", ({ recipient, conversationId, reason }) => {
		const recipientSocketId = activeUsers.get(recipient);
		io.to(recipientSocketId).emit("call-rejected", {
			conversationId,
			reason,
		});
	});

	socket.on("hang-up", ({ recipient, conversationId }) => {
		const recipientSocketId = activeUsers.get(recipient);
		if (recipientSocketId) {
			io.to(recipientSocketId).emit("hang-up", { conversationId });
		}
	});

	socket.on("disconnect", () => {
		for (let [userId, socketId] of activeUsers.entries()) {
			if (socketId === socket.id) {
				activeUsers.delete(userId);
				const contacts = socket.contacts || [];

				contacts.forEach((contactId) => {
					const contactSocketId = activeUsers.get(contactId);
					if (contactSocketId) {
						io.to(contactSocketId).emit("user-status", {
							userId,
							online: false,
						});
					}
				});
				break;
			}
		}

		const userId = socket.userId; // Assuming you store the user ID in the socket object
		const rooms = socket.rooms; // Get all the rooms the user is part of

		rooms.forEach((roomId) => {
			socket.to(roomId).emit("user-left", userId); // Notify others in the room that the user has left
			socket.leave(roomId); // Remove the user from the room
		});

		console.log(`User ${userId} disconnected`);
	});
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
	res.header("Access-Control-Allow-Credentials", "true");
	res.status(err.status || 500).json({
		message: err.message || "Internal Server Error",
	});
});

// Start server
server.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on https://localhost:${port}`);
});
