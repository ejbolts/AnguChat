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
];

// Fetch all users
app.get("/users", (req, res) => {
  res.send(users);
});

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

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
