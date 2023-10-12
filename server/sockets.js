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
    socket.emit("assign-id", socket.id); // This will send the socket ID to the client
    // Send a connection message
    io.emit("system-message", {
      content: "A user has joined the chat",

      timestamp: new Date(),
      isSystemMessage: true,
    });

    socket.on("broadcast", (message) => {
      io.emit("broadcast", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Send a disconnection message
      io.emit("system-message", {
        content: "A user has left the chat",
        timestamp: new Date(),
        isSystemMessage: true,
      });
    });
  });
};

module.exports = {
  setupSockets,
};
