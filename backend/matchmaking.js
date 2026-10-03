import crypto from "node:crypto";
import { activeChats, users } from "./state.js";
import { cancelMatchmaking, startMatchmaking } from "./redis.js";

export function registerMatchmakingHandlers({ io, socket, userId, name }) {
  socket.on("START_CHAT_MATCHMAKING", async () => {
    console.log(name, " started matchmaking");
    let waitingUserId;
    do {
      const result = await startMatchmaking(userId);
      if (result.alreadyQueued) return;
      waitingUserId = result.waitingUserId;

      if (!waitingUserId) break;
      const waitingUser = users.get(waitingUserId);
      if (!waitingUser) {
        await cancelMatchmaking(waitingUserId);
        waitingUserId = undefined;
      }
    } while (!waitingUserId);

    if (waitingUserId) {
      const waitingUser = users.get(waitingUserId);

      const chatId = crypto.randomUUID();
      activeChats.set(chatId, {
        users: [waitingUserId, userId],
      });

      console.log(
        "match found: ",
        waitingUser.userName,
        " X ",
        users.get(userId).userName,
      );

      io.to(waitingUser.socketId).emit("MATCH_FOUND", chatId);
      io.to(users.get(userId).socketId).emit("MATCH_FOUND", chatId);
      return;
    }

    console.log("waiting..");
  });

  socket.on("CANCEL_CHAT_MATCHMAKING", async () => {
    await cancelMatchmaking(userId);
  });
}
