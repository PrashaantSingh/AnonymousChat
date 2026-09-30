import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { registerConnectionHandlers } from "./connection.js";

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});

registerConnectionHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
