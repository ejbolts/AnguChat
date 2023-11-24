const socketIo = require("socket.io");

const setupSockets = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);
    socket.emit("connection", socket.id);

    // When a user joins a channel
    socket.on("joinChannel", ({ channelId, groupId, userId }) => {
      socket.join(channelId);
      console.log(`${userId} from ${groupId} joined channel ${channelId}`);

      // Notify users in the channel
      io.to(channelId).emit("system-message", {
        content: `user ${userId} has joined channel ${channelId}`,
        timestamp: new Date(),
        isSystemMessage: true,
      });

      io.in(channelId)
        .allSockets()
        .then((sockets) => {});
    });

    // Listen for 'callUser' event and relay it to the specified user
    socket.on("callUser", ({ anotherUserSockID, from }) => {
      // should needs to be the socket id of the user being called
      io.to(anotherUserSockID).emit("incomingCall", { from });
    });
    // When a user leaves a channel
    socket.on("leaveChannel", ({ channelId, groupId, userId }) => {
      socket.leave(channelId);
      console.log(`${userId} left channel ${channelId}`);

      // Notify users in the channel
      io.to(channelId).emit("system-message", {
        content: `${userId} has left channel ${channelId}`,
        timestamp: new Date(),
        isSystemMessage: true,
      });
    });

    socket.on("sendMessage", ({ channelId, message }) => {
      // Ensure the server socket joins the specified channel
      socket.join(channelId);

      // Emit the message to the specified channel
      io.to(channelId).emit("channel-message", {
        content: message.content,
        username: message.username,
        timestamp: message.timestamp,
        channelId: channelId,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Send a disconnection message to all rooms the user was in
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          // Avoid sending to the individual socket room
          io.to(roomId).emit("system-message", {
            content: `User ${socket.id} has left the chat`,
            timestamp: new Date(),
            isSystemMessage: true,
          });
        }
      });
    });
  });
};

module.exports = {
  setupSockets,
};
