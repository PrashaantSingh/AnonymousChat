import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import crypto from "node:crypto";

const chatMatchmakingQueue = [];
const activeChats = new Map();
const users = new Map();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // console.log(socket.handshake.auth);
  const userId = socket?.handshake?.auth?.userId;
  const name = socket.handshake.auth.userName;
  console.log(name, " connected: " + socket.id);

  users.set(userId, { ...socket.handshake.auth, socketId: socket.id });

  //starting chat matchmake
  socket.on("START_CHAT_MATCHMAKING", () => {
    console.log(name, " started matchmaking");
    if (chatMatchmakingQueue.includes(userId)) {
      return;
    }
    if (chatMatchmakingQueue.length > 0) {
      const waitingUserId = chatMatchmakingQueue.shift();
      const chatId = crypto.randomUUID();
      activeChats.set(chatId, {
        users: [waitingUserId, userId],
      });

      console.log(
        "match found: ",
        users.get(waitingUserId).userName,
        " X ",
        users.get(userId).userName,
      );

      io.to(users.get(waitingUserId).socketId).emit("MATCH_FOUND", chatId);
      io.to(users.get(userId).socketId).emit("MATCH_FOUND", chatId);
    } else {
      console.log("waiting..");
      chatMatchmakingQueue.push(socket.handshake.auth.userId);
    }

    console.log(chatMatchmakingQueue.length);
  });

  // handling exiting private chat
  socket.on("EXIT_PRIVATE_CHAT", (chatId) => {
    console.log("chat id: ", chatId);
    const chat = activeChats.get(chatId);
    if (!chat) return;

    if (!chat.users.includes(userId)) {
      return;
    }

    const partnerId = chat.users.find((id) => id != userId);
    const partner = users.get(partnerId).socketId;
    console.log("partner: ", partner);

    io.to(partner).emit("PARTNER_LEFT");
    activeChats.delete(chatId);

    console.log(socket.handshake.auth.userName, " exited the chat");
  });

  // sending message and receiving

  socket.on("SEND_PRIVATE_MESSAGE", (msg) => {
    const receiverId = activeChats
      .get(msg.chatId)
      ?.users?.find((id) => id != msg.senderId);
    const receiverIdSocketId = users.get(receiverId).socketId;
    console.log("RECEIVER: ", receiverIdSocketId);
    console.log("SENDER: ", users.get(msg.senderId).socketId);
    socket.to(receiverIdSocketId).emit("RECEIVE_PRIVATE_MESSAGE", msg);
  });

  //cancel matchmaking

  socket.on("CANCEL_CHAT_MATCHMAKING", () => {
    const index = chatMatchmakingQueue.indexOf(userId);

    if (index !== -1) {
      chatMatchmakingQueue.splice(index, 1);
    }
    console.log(chatMatchmakingQueue.length);
  });

  socket.on("disconnect", () => {
    console.log("disconnected: ", socket.id);
    users.delete(userId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
