const socketIo = require("socket.io");
const userConnections = {};
const express = require("express");
const router = express.Router();
const Filter = require('bad-words'),

  filter = new Filter();
router.get("/getConnectionInfo/:userId", (req, res) => {
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
      origin: ["http://localhost:4200"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on('error', (error) => {
    console.error('Socket.IO server error:', error);
  });

  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);
    socket.emit("connection", socket.id);

    // Handle WebSocket errors
    socket.on('error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for an event where the client sends their user ID and PeerJS ID
    socket.on("connectUserIDs", ({ userId, peerId }) => {
      userConnections[userId] = {
        socketId: socket.id,
        peerId: peerId,
      };
      socket.broadcast.emit('login', userId)
      console.log("userConnections:", userConnections);
    });

    socket.on("UserLogout", (userId, username) => {

      console.log("userConnections:", userConnections);
      socket.broadcast.emit('logout', userId)
      // Notify users in the channel
      io.emit("system-message", {
        content: `User ${username} has left the channel`,
        timestamp: new Date(),
        isSystemMessage: true,
      });
      delete userConnections[userId]
    });

    socket.on("deleteMessage", (messageId, channelId) => {
      io.to(channelId).emit('messageDeleted', { messageId, channelId });
    });
    socket.on("updateMessage", (messageId, messageContent, channelId) => {
      io.emit("editedMessage", { messageId, messageContent, channelId })
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

    });

    // When a user leaves a channel
    socket.on("leaveChannel", ({ channelId, username }) => {
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


    socket.on("sendMessage", ({ channelId, message }) => {
      // Ensure the server socket joins the specified channel
      socket.join(channelId);

      if (message.content === "") {
        console.log("Message is empty");
        io.to(channelId).emit("channel-message", {
          id: message.id,
          content: message.content,
          username: message.username,
          timestamp: message.timestamp,
          image: message.image,
          channelId: channelId,
          profilePic: message.profilePic,
          isEdited: message.isEdited,
        });
      } else {
        console.log("Message is not empty");
        io.to(channelId).emit("channel-message", {
          id: message.id,
          content: filter.clean(message.content),
          username: message.username,
          timestamp: message.timestamp,
          image: message.image,
          channelId: channelId,
          profilePic: message.profilePic,
          isEdited: message.isEdited,
        });
      }
    });

    socket.on("typing", ({ channelId, username }) => {
      console.log("testing that this user is typing:", username);
      io.to(channelId).emit("serverEmitTyping", { channelId, message: `${username} is typing...` });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      console.log("userConnections", userConnections)
      for (const userId in userConnections) {
        if (userConnections[userId].socketId === socket.id) {
          delete userConnections[userId];
          console.log(`Removed mapping for user ${userId}`);
          socket.broadcast.emit('logout', userId)
          break;
        }
      }

    });
  });
  return io;
};
module.exports = router;
module.exports.setupSockets = setupSockets; 