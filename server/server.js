const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketModule = require("./sockets");

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const updateRoute = require("./routes/update");
const removeRoute = require("./routes/remove");
const groupRoute = require("./routes/group");
const channelRoute = require("./routes/channel");

const app = express();
const listen = (server) => {
  server.listen(3000, () => {
    console.log("Server listening on port 3000");
  });
};
// Middleware
app.use(cors());
app.use(bodyParser.json());
const server = http.createServer(app);
// Socket.io setup
socketModule.setupSockets(server);
listen(server);

// Routes
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/update", updateRoute);
app.use("/remove", removeRoute);
app.use("/group", groupRoute);
app.use("/channel", channelRoute);

module.exports = app;
