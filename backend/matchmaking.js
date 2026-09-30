import crypto from "node:crypto";
import { activeChats, chatMatchmakingQueue, users } from "./state.js";

export function registerMatchmakingHandlers({ io, socket, userId, name }) {
  socket.on("START_CHAT_MATCHMAKING", () => {
    console.log(name, " started matchmaking");
    if (chatMatchmakingQueue.includes(userId)) return;

    let waitingUserId = chatMatchmakingQueue.shift();
    while (waitingUserId && !users.has(waitingUserId)) {
      waitingUserId = chatMatchmakingQueue.shift();
    }

    if (waitingUserId) {
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
      return;
    }

    console.log("waiting..");
    chatMatchmakingQueue.push(userId);
    console.log(chatMatchmakingQueue.length);
  });

  socket.on("CANCEL_CHAT_MATCHMAKING", () => {
    const index = chatMatchmakingQueue.indexOf(userId);
    if (index !== -1) chatMatchmakingQueue.splice(index, 1);
    console.log(chatMatchmakingQueue.length);
  });
}
