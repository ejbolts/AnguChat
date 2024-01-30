const socketIo = require("socket.io");
const userConnections = {};
const express = require("express");
const router = express.Router();
const Filter = require('bad-words'),

  filter = new Filter();
router.get("/getConnectionInfo/:userId", (req, res) => {
  console.log("testtestest")
  const userId = req.params.userId;
  const connectionInfo = userConnections[userId];

  if (connectionInfo) {
    console.log(connectionInfo)
    return res.json(connectionInfo);
  }

  if (res.status(404)) {
    return res.status(404).json({ socketId: null, peerId: null, message: "User connection info not found" });

  }

});

const setupSockets = (expressSocketIOServer) => {
  const io = socketIo(expressSocketIOServer, {
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
      socket.broadcast.emit('login', userId)
      console.log("bordcast login")
      console.log("userConnections:", userConnections);
    });

    socket.on("UserLogout", (userId) => {
      console.log("user logging out: ", userId)
      delete userConnections[userId]
      console.log("userConnections:", userConnections);
      socket.broadcast.emit('logout', userId)
      console.log("emitted logout")
    });



    // When a user joins a channel
    socket.on("joinChannel", ({ channelId, groupId, username }) => {
      socket.join(channelId);
      console.log(`${username} from ${groupId} joined channel ${channelId}`);

      // Notify users in the channel
      io.to(channelId).emit("system-message", {
        content: `User ${username} has joined the channel`,
        timestamp: new Date(),
        isSystemMessage: true,
        channelId: channelId,
      });

      io.in(channelId)
        .allSockets()
        .then((sockets) => { });
    });

    // Listen for 'callUser' event and relay it to the specified user
    socket.on("callUser", ({ anotherUserSockID, from, socketID, username }) => {
      // should needs to be the socket id of the user being called
      console.log("callUser", anotherUserSockID, from, socketID, username);
      io.to(anotherUserSockID).emit("incomingCall", {
        from,
        socketID,
        username,
      });
    });

    socket.on("call-declined", (data) => {
      // Notify the caller that the call was declined
      // 'data.callerId' should be the socket ID of the caller
      console.log("call-declined", data);
      io.to(data.callerId).emit("call-declined", { message: "Call declined" });
    });

    // When a user leaves a channel
    socket.on("leaveChannel", ({ channelId, groupId, username }) => {
      socket.leave(channelId);
      console.log(`${username} left channel ${channelId}`);

      // Notify users in the channel
      io.to(channelId).emit("system-message", {
        content: `User ${username} has left the channel`,
        timestamp: new Date(),
        isSystemMessage: true,
        channelId: channelId,
      });
    });

    socket.on("sendMessage", ({ channelId, message }) => {
      // Ensure the server socket joins the specified channel
      socket.join(channelId);

      io.to(channelId).emit("channel-message", {
        content: filter.clean(message.content),
        username: message.username,
        timestamp: message.timestamp,
        image: message.image,
        channelId: channelId,
        profilePic: message.profilePic,
      });
    });

    socket.on("typing", ({ channelId, username }) => {
      console.log("testing that this user is typing:", username);
      io.to(channelId).emit("serverEmitTyping", { channelId, message: `${username} is typing...` });
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
  return io;
};
module.exports = router;
module.exports.setupSockets = setupSockets; 