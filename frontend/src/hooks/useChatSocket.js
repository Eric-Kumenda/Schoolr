// src/hooks/useChatSocket.js
import { useEffect } from "react";
import socket from "../socket";

export const useChatSocket = ({ conversationId, onMessage }) => {
  useEffect(() => {
    if (!conversationId) return;

    socket.connect();
    socket.emit("join_conversation", conversationId);

    socket.on("receive_message", onMessage);

    return () => {
      socket.off("receive_message", onMessage);
      socket.disconnect();
    };
  }, [conversationId, onMessage]);
};
