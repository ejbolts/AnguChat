const socketIo = require("socket.io");
const userConnections = {};
const express = require("express");
const router = express.Router();

router.get("/getConnectionInfo/:userId", (req, res) => {
  console.log("getConnectionInfo req:", req);
  const userId = req.params.userId;
  const connectionInfo = userConnections[userId];

  if (connectionInfo) {
    res.json(connectionInfo);
  } else {
    res.status(404).send("User connection info not found");
  }
});

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

    // Listen for an event where the client sends their user ID and PeerJS ID
    socket.on("connectUserIDs", ({ userId, peerId }) => {
      userConnections[userId] = {
        socketId: socket.id,
        peerId: peerId,
      };

      console.log("userConnections:", userConnections);
    });

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
        image: message.image,
        channelId: channelId,
        profilePic: message.profilePic,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      for (const userId in userConnections) {
        if (userConnections[userId].socketId === socket.id) {
          delete userConnections[userId];
          console.log(`Removed mapping for user ${userId}`);
          break;
        }
      }

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

module.exports = router;
module.exports.setupSockets = setupSockets;
