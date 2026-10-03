import { activeChats, users } from "./state.js";

export function registerPrivateChatHandlers({ io, socket, userId, name }) {
  socket.on("GET_PRIVATE_CHAT_STATUS", (chatId) => {
    const chat = activeChats.get(chatId);
    const partnerId = chat?.users.find((id) => id !== userId);
    socket.emit("PRIVATE_CHAT_STATUS", {
      chatId,
      active: Boolean(chat?.users.includes(userId)),
      partnerName: users.get(partnerId)?.userName || null,
      partnerOnline: Boolean(users.get(partnerId)?.socket?.connected),
    });
  });

  socket.on("EXIT_PRIVATE_CHAT", (chatId) => {
    console.log("chat id: ", chatId);
    const chat = activeChats.get(chatId);
    if (!chat || !chat.users.includes(userId)) return;

    const partnerId = chat.users.find((id) => id !== userId);
    const partner = users.get(partnerId)?.socketId;
    if (partner) io.to(partner).emit("PARTNER_LEFT", { chatId });

    activeChats.delete(chatId);
    console.log(name, " exited the chat");
  });

  socket.on("SEND_PRIVATE_MESSAGE", (message = {}) => {
    const chat = activeChats.get(message.chatId);
    if (
      !chat ||
      !chat.users.includes(userId) ||
      typeof message.content !== "string" ||
      !message.content.trim()
    ) {
      return;
    }

    const receiverId = chat.users.find((id) => id !== userId);
    const receiver = users.get(receiverId)?.socketId;
    if (!receiver) return;

    socket.to(receiver).emit("RECEIVE_PRIVATE_MESSAGE", {
      chatId: message.chatId,
      senderId: userId,
      content: message.content.trim(),
    });
  });

  return () => {
    for (const [chatId, chat] of activeChats) {
      if (!chat.users.includes(userId)) continue;

      const partnerId = chat.users.find((id) => id !== userId);
      const partner = users.get(partnerId)?.socketId;
      if (partner) io.to(partner).emit("PARTNER_LEFT", { chatId });
      activeChats.delete(chatId);
    }
  };
}

export function notifyPrivateChatStatus(io, userId, online) {
  for (const [chatId, chat] of activeChats) {
    if (!chat.users.includes(userId)) continue;

    const partnerId = chat.users.find((id) => id !== userId);
    const partnerSocketId = users.get(partnerId)?.socketId;
    if (partnerSocketId) {
      io.to(partnerSocketId).emit("PARTNER_STATUS", { chatId, online });
    }
  }
}
