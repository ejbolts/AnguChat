const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketModule = require("./sockets");
const cookieParser = require("cookie-parser");
const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const updateRoute = require("./routes/update");
const removeRoute = require("./routes/remove");
const groupRoute = require("./routes/group");
const channelRoute = require("./routes/channel");
const bucketRoute = require("./routes/bucket");
const socketsRoute = require("./sockets"); // Import the sockets.js file
const expressPeerServer = require("peer").ExpressPeerServer;

const csrf = require("csurf");

const app = express();
app.use(cookieParser());

const server = http.createServer(app);
const options = {
  debug: true,
};
// Body parser for parsing JSON and urlencoded data

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: "Strict" } });

app.use(csrfProtection);

app.get("/get-csrf-token", (req, res) => {
  const token = req.csrfToken();
  console.log("Generated CSRF token:", token);
  res.json({ csrfToken: token });
});
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
