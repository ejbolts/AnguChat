// file manages logging in, out and registering users 
const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const User = require("../user.model");
const saltRounds = 10;
// Route for getting all users
router.get("/", async (req, res) => {
  console.log("Fetching all users...");
  await connect();
  const users = await db().collection("users").find({}).toArray();
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

router.post("/login", async (req, res) => {
  console.log(`Attempting to login user with username: ${req.body.username}`);
  console.log("CSRF token received in headers:", req.headers["csrf-token"]);
  console.log("Cookies received:", req.cookies);

  await connect();

  const { username, password } = req.body;

  try {
    // Retrieve and update user in one operation
    const user = await db().collection("users").findOneAndUpdate(
      { username: username },
      { $set: { isOnline: true } },
      { returnDocument: 'after' }
    );

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        res.json({ message: "Logged in successfully!", user: user });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: "Server error during login process" });
  }
});


router.post("/logout", async (req, res) => {
  console.log(`Attempting to logout user with username: ${req.body.username}`);
  console.log("CSRF token received in headers:", req.headers["csrf-token"]);
  console.log("Cookies received:", req.cookies);

  await connect();

  const { username } = req.body;

  try {
    const user = await db().collection("users").findOneAndUpdate(
      { username: username },
      { $set: { isOnline: false } },
      { returnDocument: 'after' }
    );

    if (user) {
      res.json({ message: "User logged out successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: "Server error during logout process" });
  }
});


router.post("/", async (req, res) => {
  await connect();
  const userData = req.body;
  const existingUser = await db()
    .collection("users")
    .findOne({ username: userData.username });

  if (existingUser) {
    return res.status(400).json({ message: "Username already exists." });
  }
  if (userData.username.length < 4 || userData.username.length > 15) {
    return res.status(400).json({ message: "Username should be at least 4 characters long and max 15." });
  }
  if (userData.password.length <= 3) {
    return res.status(400).json({ message: "Password should be at least 4 characters long." });
  }

  const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
  userData.password = hashedPassword;
  const user = new User(
    null,
    userData.username,
    userData.password,
    userData.role,
    userData.profilePic,
    userData.isOnline
  );
  const result = await db().collection("users").insertOne(user);

  res.json({ message: "User registered!", _id: result.insertedId });
  close();
});

module.exports = router;
