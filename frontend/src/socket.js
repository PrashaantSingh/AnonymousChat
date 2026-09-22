import { io } from "socket.io-client";

export default function createSocketConnection(socketUrl, config = {}) {
  return io(socketUrl, config);
}
