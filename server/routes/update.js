const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");

router.put("/:id/role", async (req, res) => {
  await connect();
  const userId = new ObjectId(req.params.id);
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: "Role is required." });
  }

  try {
    await db()
      .collection("users")
      .updateOne({ _id: userId }, { $set: { role: role } });
    res.json({ message: "User role updated!" });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ message: "Error updating user role." });
  } finally {
    close();
  }
});

// create a endpoint to update the username
router.put("/:id/username", async (req, res) => {
  await connect();
  const userId = new ObjectId(req.params.id);
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    await db()
      .collection("users")
      .updateOne({ _id: userId }, { $set: { username: username } });
    res.json({ message: "Username updated successfully!" });
  } catch (err) {
    console.error("Error updating username:", err);
    res.status(500).json({ message: "Error updating username." });
  } finally {
    close();
  }
});

//takes in userid string and imgURL string
router.put("/:id/profileImage", async (req, res) => {
  await connect();
  const userId = new ObjectId(req.params.id);
  const { imgURL } = req.body;

  if (!imgURL) {
    return res.status(400).json({ message: "Image URL is required." });
  }

  try {
    console.log("profilePic:", imgURL);
    console.log("userId:", userId);
    await db()
      .collection("users")
      .updateOne({ _id: userId }, { $set: { profilePic: imgURL } });
    res.json({ message: "User image updated!" });
  } catch (err) {
    console.error("Error updating user image:", err);
    res.status(500).json({ message: "Error updating user image." });
  } finally {
    close();
  }
})

router.put("/:id/password", async (req, res) => {
  await connect();
  const userId = new ObjectId(req.params.id);
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "password is required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await db()
      .collection("users")
      .findOneAndUpdate(
        { _id: userId },
        { $set: { password: hashedPassword } }
      );
    res.json({ message: "password updated!", password: hashedPassword });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Error updating password." });
  } finally {
    close();
  }
});

module.exports = router;
