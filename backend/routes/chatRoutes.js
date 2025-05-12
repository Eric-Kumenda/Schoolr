const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const supabase = require("../supabaseClient");
const mongoose = require("mongoose");

// Create a new conversation
router.post("/", async (req, res) => {
	try {
		const chat = new Chat(req.body);
		await chat.save();
		res.status(201).json(chat);
	} catch (err) {
		res.status(400).json({ message: err.message });
	}
});

// Get all conversations for a user
router.get("/user/:userId", async (req, res) => {
	try {
		// Step 1: Fetch conversations from MongoDB
		const chats = await Chat.find({ members: req.params.userId });

		// Step 2: Extract all unique member IDs
		const allMemberIds = [
			...new Set(chats.flatMap((chat) => chat.members)),
		];

		// Step 3: Fetch user data from Supabase
		const { data: users, error } = await supabase
			.from("users")
			.select("id, first_name, last_name, schoolId, role")
			.in("id", allMemberIds);

		if (error) {
			return res.status(500).json({ message: error.message });
		}

		// Step 4: Create a lookup map from user ID to user data
		const userMap = {};
		users.forEach((user) => {
			userMap[user.id] = user;
		});

		// Step 5: Replace member UUIDs with user info
		const enrichedChats = chats.map((chat) => {
			return {
				...chat.toObject(), // Convert Mongoose document to plain object
				members: chat.members.map(
					(memberId) =>
						userMap[memberId] || { id: memberId, missing: true }
				),
			};
		});

		// Step 6: Return enriched chat objects
		res.json({ conversations: enrichedChats });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
});

// Send a message to a conversation
router.post("/:conversationId/message", async (req, res) => {
	const { sender, message } = req.body;
	try {
		const chat = await Chat.findOne({
			conversation_id: req.params.conversationId,
		});
		if (!chat)
			return res.status(404).json({ message: "Conversation not found" });

		const newMessage = {
			sender,
			message,
			read: false,
			timestamp: new Date(),
		};

		chat.messages.push(newMessage);
		chat.total_messages += 1;
		chat.time = new Date(); // update last activity
		await chat.save();

		res.status(201).json(chat);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Get messages with pagination
router.get("/conversation/:convoId", async (req, res) => {
	const { convoId } = req.params;
	const { page = 1, limit = 20 } = req.query;
	const start = (page - 1) * limit; // Fix missing `start` calculation

	try {
		const chat = await Chat.findOne({ conversation_id: convoId });
		if (!chat) return res.status(404).json({ message: "Chat not found" });

		// Step 1: Fetch user data from Supabase for all members in the chat
		const { data: users, error } = await supabase
			.from("users")
			.select("id, first_name, last_name, schoolId, role")
			.in("id", chat.members);

		if (error) {
			return res.status(500).json({ message: error.message });
		}

		// Step 2: Create a lookup map from user ID to user data
		const userMap = {};
		users.forEach((user) => {
			userMap[user.id] = user;
		});

		// Step 3: Replace member UUIDs with user info
		const enrichedMembers = chat.members.map(
			(memberId) => userMap[memberId] || { id: memberId, missing: true }
		);

		// Step 4: Paginate messages
		const end = start + parseInt(limit);
		const paginatedMessages = chat.messages
			.slice()
			.reverse()
			.slice(start, end);

		// Step 5: Return enriched chat object with paginated messages
		res.json({
			conversation_id: chat.conversation_id,
			members: enrichedMembers,
			total_messages: chat.total_messages,
			messages: paginatedMessages,
			is_group: chat.is_group,
			group_name: chat.group_name,
		});
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Mark Message as read
router.post("/conversation/:convoId/read", async (req, res) => {
	const { convoId } = req.params;
	const { messageIds, userId } = req.body;

	const messageObjectIds = messageIds.map((id) =>
		new mongoose.Types.ObjectId(id)
	);
	try {
		const chat = await Chat.findOne({ conversation_id: convoId });
		if (!chat) {
			return res.status(404).json({ message: "Chat not found" });
		}

		// Update the read status of messages that belong to the other user
		const updatedChat = await Chat.findOneAndUpdate(
			{
				conversation_id: convoId,
				//'messages._id': { $in: messageIds },
				//'messages.sender': { $ne: userId }, // Don't mark own messages as read
			},
			{
				$set: { "messages.$[elem].read": true },
			},
			{
				arrayFilters: [
					{
						"elem._id": { $in: messageObjectIds },
						"elem.sender": { $ne: userId },
					},
				],
				new: true, // Return the updated document
			}
		);

		if (updatedChat) {
			res.json({ message: "Messages marked as read successfully" });
			// Optionally, emit a Socket.IO event to other users in the chat
			// io.to(convoId).emit('messages_read', { convoId, messageIds, readerId: userId });
		} else {
			res.status(200).json({
				message: "No unread messages from others found to mark as read",
			});
		}
	} catch (error) {
		console.error("Error marking messages as read:", error);
		res.status(500).json({ message: "Failed to mark messages as read" });
	}
});

module.exports = router;
