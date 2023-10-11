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

    socket.on("broadcast", (message) => {
      io.emit("broadcast", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = {
  setupSockets,
};
