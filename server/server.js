const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketModule = require("./sockets");
const cookieParser = require("cookie-parser");
const authenticationRoute = require("./routes/authentication");
const updateRoute = require("./routes/update");
const removeRoute = require("./routes/remove");
const groupRoute = require("./routes/group");
const channelRoute = require("./routes/channel");
const bucketRoute = require("./routes/bucket");
const socketsRoute = require("./sockets");
const expressPeerServer = require("peer").ExpressPeerServer;


const csrf = require("csurf");
const app = express();
app.use(cookieParser());

const expressSocketIOServer = http.createServer(app);
const peerServer = http.createServer(app);
// Body parser for parsing JSON and urlencoded data

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: "strict" } });
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['http://localhost:4200'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from this origin: ' + origin));
    }
  },
  credentials: true
}));
app.use(csrfProtection);

app.get("/api/get-csrf-token", (req, res) => {
  const token = req.csrfToken();
  console.log("Generated CSRF token:", token);
  res.json({ csrfToken: token });
});
// Peer Server setup
const peerJsOptions = { debug: true };
app.use("/", expressPeerServer(peerServer, peerJsOptions)); // Integrate PeerServer with express

// Socket.io setup
socketModule.setupSockets(expressSocketIOServer);



// Routes
app.use("/api/authentication", authenticationRoute);
app.use("/api/update", updateRoute);
app.use("/api/remove", removeRoute);
app.use("/api/group", groupRoute);
app.use("/api/channel", channelRoute);
app.use("/api/bucket", bucketRoute);
app.use("/api/sockets", socketsRoute);

// Start the server
const expressPort = 3000;
const peerPort = 3001;

expressSocketIOServer.listen(expressPort, () => {
  console.log(`Express and Socket.io server running on port ${expressPort}`);
});

peerServer.listen(peerPort, () => {
  console.log(`PeerJS server running on port ${peerPort}`);
});

module.exports = app;
