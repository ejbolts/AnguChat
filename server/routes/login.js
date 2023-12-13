const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");

// Route for getting all users
router.get("/", async (req, res) => {
  console.log("Fetching all users...");
  await connect();
  const users = await db().collection("users").find({}).toArray();
  console.log("Users fetched:", users);
  res.json(users);
  close();
});

// Route for getting a specific user by its _id
router.get("/:id", async (req, res) => {
  console.log(`Fetching user with ID: ${req.params.id}`);
  await connect();
  const userId = new ObjectId(req.params.id);
  const user = await db().collection("users").findOne({ _id: userId });
  if (user) {
    console.log("User found:", user);
    res.json(user);
  } else {
    console.log("User not found!");
    res.status(404).json({ message: "User not found!" });
  }
  close();
});

// Route for logging in a user
router.post("/", async (req, res) => {
  console.log(`Attempting to login user with username: ${req.body.username}`);
  await connect();

  const { username, password } = req.body;

  // Retrieve user by username only
  const user = await db().collection("users").findOne({ username: username });

  if (user) {
    // Compare the provided password with the hashed password
    console.log("passowrd", password);
    console.log("user passowrd", user.password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      console.log("User logged in successfully:", user);
      res.json({ message: "Logged in successfully!", user: user });
    } else {
      console.log("Invalid password!");
      res.status(401).json({ message: "Invalid credentials!" });
    }
  } else {
    console.log("Username not found!");
    res.status(401).json({ message: "Invalid credentials!" });
  }

  close();
});

module.exports = router;
