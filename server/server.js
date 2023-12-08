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
const bucketRoute = require("./routes/bucket");
const socketsRoute = require("./sockets"); // Import the sockets.js file
const expressPeerServer = require("peer").ExpressPeerServer;

const app = express();
const server = http.createServer(app);
const options = {
  debug: true,
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Peer Server setup
app.use("/peerjs", expressPeerServer(server, options)); // Integrate PeerServer with express

// Socket.io setup
socketModule.setupSockets(server);

// Routes
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/update", updateRoute);
app.use("/remove", removeRoute);
app.use("/group", groupRoute);
app.use("/channel", channelRoute);
app.use("/bucket", bucketRoute);
app.use("/sockets", socketsRoute);

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
