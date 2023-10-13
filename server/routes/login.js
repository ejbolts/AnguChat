const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

// Route for getting all users
router.get("/", async (req, res) => {
  console.log("Fetching all users..."); // Added
  await connect();
  const users = await db().collection("users").find({}).toArray();
  console.log("Users fetched:", users); // Added
  res.json(users);
  close();
});

// Route for getting a specific user by its _id
router.get("/:id", async (req, res) => {
  console.log(`Fetching user with ID: ${req.params.id}`); // Added
  await connect();
  const userId = new ObjectId(req.params.id);
  const user = await db().collection("users").findOne({ _id: userId });
  if (user) {
    console.log("User found:", user); // Added
    res.json(user);
  } else {
    console.log("User not found!"); // Added
    res.status(404).json({ message: "User not found!" });
  }
  close();
});

// Route for logging in a user
router.post("/", async (req, res) => {
  console.log(`Attempting to login user with username: ${req.body.username}`); // Added
  await connect();

  const { username, password } = req.body;

  const user = await db()
    .collection("users")
    .findOne({ username: username, password: password });

  if (user) {
    console.log("User logged in successfully:", user); // Added
    res.json({ message: "Logged in successfully!", user: user });
  } else {
    console.log("Login attempt failed!"); // Added
    res.status(401).json({ message: "Invalid credentials!" });
  }

  close();
});

module.exports = router;
