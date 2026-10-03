import crypto from "node:crypto";
import { rooms } from "./state.js";

function getRoomSummary(room) {
  return {
    roomId: room.roomId,
    name: room.name,
    creatorId: room.creatorId,
    memberCount: room.members.size,
  };
}

function addSystemMessage(io, room, content) {
  const message = {
    senderId: "system",
    senderName: "SYSTEM",
    type: "system",
    content,
  };

  room.messages.push(message);
  io.to(room.roomId).emit("RECEIVE_ROOM_MESSAGE", message);
}

export function registerRoomHandlers({ io, socket, userId, name }) {
  function removeUserFromRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room || !room.members.delete(userId)) return;

    addSystemMessage(io, room, `${name} left the room.`);
    socket.leave(roomId);

    if (room.members.size === 0) {
      rooms.delete(roomId);
      io.emit("ROOM_DELETED", roomId);
      return;
    }

    io.to(roomId).emit("ROOM_UPDATED", getRoomSummary(room));
  }

  socket.on("CREATE_ROOM", ({ name: roomName } = {}) => {
    const normalizedRoomName =
      typeof roomName === "string" ? roomName.trim() : "";
    if (!normalizedRoomName) {
      socket.emit("ROOM_ERROR", "A room name is required.");
      return;
    }

    const roomId = crypto.randomUUID();
    const room = {
      roomId,
      name: normalizedRoomName,
      creatorId: userId,
      members: new Set([userId]),
      messages: [],
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    room.messages.push({
      senderId: "system",
      senderName: "SYSTEM",
      type: "system",
      content: `${name} created the room.`,
    });

    socket.emit("ROOM_JOINED", {
      room: getRoomSummary(room),
      messages: room.messages,
    });
  });

  socket.on("GET_MY_ROOMS", () => {
    const ownedRooms = [...rooms.values()]
      .filter((room) => room.creatorId === userId && room.members.size > 0)
      .map(getRoomSummary);

    socket.emit("MY_ROOMS", ownedRooms);
  });

  socket.on("JOIN_ROOM", (roomId) => {
    const normalizedRoomId = typeof roomId === "string" ? roomId.trim() : "";
    const room = rooms.get(normalizedRoomId);
    if (!room) {
      socket.emit("ROOM_ERROR", "That room does not exist or has been closed.");
      return;
    }

    const isNewMember = !room.members.has(userId);
    room.members.add(userId);
    socket.join(normalizedRoomId);

    if (isNewMember) {
      addSystemMessage(io, room, `${name} joined the room.`);
    }

    socket.emit("ROOM_JOINED", {
      room: getRoomSummary(room),
      messages: room.messages,
    });
    io.to(normalizedRoomId).emit("ROOM_UPDATED", getRoomSummary(room));
  });

  socket.on("DELETE_ROOM", (roomId) => {
    const normalizedRoomId = typeof roomId === "string" ? roomId.trim() : "";
    const room = rooms.get(normalizedRoomId);
    if (!room) {
      socket.emit(
        "ROOM_ERROR",
        "That room does not exist or has already been deleted.",
      );
      return;
    }

    if (room.creatorId !== userId) {
      socket.emit("ROOM_ERROR", "Only the room creator can delete this room.");
      return;
    }

    socket.to(normalizedRoomId).emit("ROOM_DELETED", normalizedRoomId);
    rooms.delete(normalizedRoomId);
    io.in(normalizedRoomId).socketsLeave(normalizedRoomId);
  });

  socket.on("LEAVE_ROOM", removeUserFromRoom);

  socket.on("SEND_ROOM_MESSAGE", ({ roomId, content } = {}) => {
    const normalizedRoomId = typeof roomId === "string" ? roomId.trim() : "";
    const room = rooms.get(normalizedRoomId);
    if (
      !room ||
      !room.members.has(userId) ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return;
    }

    const message = {
      senderId: userId,
      senderName: name,
      content: content.trim(),
    };

    room.messages.push(message);
    io.to(normalizedRoomId).emit("RECEIVE_ROOM_MESSAGE", message);
  });

  return removeUserFromRoom;
}
