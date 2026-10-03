import { cancelMatchmaking } from "./redis.js";
import { rooms, users } from "./state.js";
import { registerMatchmakingHandlers } from "./matchmaking.js";
import {
  notifyPrivateChatStatus,
  registerPrivateChatHandlers,
} from "./privateChat.js";
import { registerRoomHandlers } from "./rooms.js";

const RECONNECT_GRACE_PERIOD = 15000;
const disconnectTimers = new Map();

export function registerConnectionHandlers(io) {
  io.on("connection", (socket) => {
    const userId = socket?.handshake?.auth?.userId;
    const name = socket?.handshake?.auth?.userName;

    if (!userId || !name) {
      socket.disconnect(true);
      return;
    }

    clearDisconnectTimer(userId);
    const previousUser = users.get(userId);
    if (previousUser?.socket && previousUser.socket.id !== socket.id) {
      previousUser.socket.disconnect(true);
    }

    console.log(name, " connected: " + socket.id);
    users.set(userId, {
      ...socket.handshake.auth,
      socket,
      socketId: socket.id,
    });

    const removeUserFromRoom = registerRoomHandlers({
      io,
      socket,
      userId,
      name,
    });
    registerMatchmakingHandlers({ io, socket, userId, name });
    const removeUserFromPrivateChats = registerPrivateChatHandlers({
      io,
      socket,
      userId,
      name,
    });
    notifyPrivateChatStatus(io, userId, true);

    socket.on("disconnect", () => {
      if (users.get(userId)?.socketId !== socket.id) return;

      console.log("disconnected: ", socket.id);
      notifyPrivateChatStatus(io, userId, false);
      const timer = setTimeout(async () => {
        if (users.get(userId)?.socketId !== socket.id) return;

        for (const roomId of roomsForUser(userId)) {
          removeUserFromRoom(roomId);
        }
        await cancelMatchmaking(userId);
        removeUserFromPrivateChats();
        users.delete(userId);
        disconnectTimers.delete(userId);
      }, RECONNECT_GRACE_PERIOD);

      disconnectTimers.set(userId, timer);
    });
  });
}

function clearDisconnectTimer(userId) {
  const timer = disconnectTimers.get(userId);
  if (!timer) return;

  clearTimeout(timer);
  disconnectTimers.delete(userId);
}

function roomsForUser(userId) {
  return [...rooms.entries()]
    .filter(([, room]) => room.members.has(userId))
    .map(([roomId]) => roomId);
}
