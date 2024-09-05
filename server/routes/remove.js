const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.delete("/:id", async (req, res) => {
  await connect();
  try {
    const userId = new ObjectId(req.params.id);

    // Find the username based on the userId
    const user = await db().collection("users").findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const username = user.username;

    await db().collection("users").deleteOne({ _id: userId });

    // Remove the user from any group's users array
    await db()
      .collection("groups")
      .updateMany(
        { users: userId.toString() },
        { $pull: { users: userId.toString() } }
      );
    // Remove the user from any channel's users array
    await db()
      .collection("channels")
      .updateMany(
        { users: userId.toString() },
        { $pull: { users: userId.toString() } }
      );

    // Remove the user's messages from the history array in each channel
    await db()
      .collection("channels")
      .updateMany(
        { "history.username": username },
        { $pull: { history: { username: username } } }
      );

    res.json({ message: "User and their group and channel memberships removed!" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(400).json({ message: "Invalid ID format" });
  } finally {
    close();
  }
});

module.exports = router;
