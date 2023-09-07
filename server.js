const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Sample route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// Mock database (replaced with MongoDB later)
let users = [
  {
    id: 1,
    username: "super",
    email: "super@example.com",
    password: "123",
    roles: ["SuperAdmin"],
    groups: [],
  },
  {
    id: 2,
    username: "groupadmin",
    email: "groupadmin2@example.com",
    password: "123",
    roles: ["GroupAdmin"],
    groups: [],
  },
  {
    id: 3,
    username: "normaluser",
    email: "normaluser@example.com",
    password: "123",
    roles: ["ChatUser"],
    groups: [],
  },
];

let groups = [];

function authenticate(req, res, next) {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ error: "Invalid credentials" });
  }
}
function isSuperAdmin(req, res, next) {
  if (req.user.roles.includes("SuperAdmin")) {
    next();
  } else {
    res.status(403).send({ error: "Access denied" });
  }
}

// User routes
app.post("/register", (req, res) => {
  // handle registration
  const user = req.body;
  users.push(user);
  res.status(201).send(user);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    const response = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        groups: user.groups,
      },
      valid: true,
    };
    res.status(200).send(response);
  } else {
    res.status(401).send({ error: "Invalid credentials", valid: false });
  }
});

// ... More routes for groups, channels, etc.

// Promote a user to Group Admin
app.put("/users/:id/promote", authenticate, isSuperAdmin, (req, res) => {
  const { id } = req.params;
  const user = users.find((u) => u.id == id);
  if (user) {
    user.roles.push("GroupAdmin");
    res.send(user);
  } else {
    res.status(404).send({ error: "User not found" });
  }
});

// ... other routes for creating groups, channels, etc.

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
