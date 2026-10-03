import express from "express";
import http from "node:http";
import { Server } from "socket.io";
import { registerConnectionHandlers } from "./connection.js";
import { connectRedis } from "./redis.js";

const app = express();
const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectRedis();
  registerConnectionHandlers(io);
  server.listen(PORT, () => console.log(`Server running on PORT: ${PORT}`));
}

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exitCode = 1;
});
