// import express from "express";
// import http from "node:http";
// import { Server } from "socket.io";

// const socketMap = new Map();
// console.log(socketMap.size);
// const app = express();

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//   },
// });

// io.on("connection", (socket) => {
//   socket.on("joined", (user) => {
//     socketMap.set(user.userId, user);
//     socket.userId = user.userId;
//     io.emit("online_users", [...socketMap.values()]);
//   });

//   socket.on("SEND_PRIVATE_MESSAGE", (msg) => {
//     const receiverSocketId = socketMap.get(msg.receiverId).socketId;
//     socket.to(receiverSocketId).emit("RECEIVE_PRIVATE_MESSAGE", msg);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//     socketMap.delete(socket.userId);
//     io.emit("online_users", [...socketMap.values()]);
//   });
// });

// server.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });


import './socket.js'