import { chatMatchmakingQueue, rooms, users } from "./state.js";
import { registerMatchmakingHandlers } from "./matchmaking.js";
import { registerPrivateChatHandlers } from "./privateChat.js";
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

    socket.on("disconnect", () => {
      if (users.get(userId)?.socketId !== socket.id) return;

      console.log("disconnected: ", socket.id);
      const timer = setTimeout(() => {
        if (users.get(userId)?.socketId !== socket.id) return;

        for (const roomId of roomsForUser(userId)) {
          removeUserFromRoom(roomId);
        }
        const queueIndex = chatMatchmakingQueue.indexOf(userId);
        if (queueIndex !== -1) chatMatchmakingQueue.splice(queueIndex, 1);
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
