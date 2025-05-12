// models/Chat.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const messageSchema = new mongoose.Schema({
  sender: String,
  message: String,
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new mongoose.Schema({
  conversation_id: { type: String, default: uuidv4, unique: true },
  time: { type: Date, default: Date.now },
  members: [String],
  messages: [messageSchema],
  total_messages: { type: Number, default: 0 },
  is_group: { type: Boolean, default: false },
  group_name: { type: String, default: null },
});

module.exports = mongoose.model("Chat", chatSchema);
