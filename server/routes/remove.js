const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.delete("/:id", async (req, res) => {
  await connect();
  try {
    const userId = new ObjectId(req.params.id);

    await db().collection("users").deleteOne({ _id: userId });

    // Remove the user from any group's users array
    await db()
      .collection("groups")
      .updateMany(
        { users: userId.toString() },
        { $pull: { users: userId.toString() } }
      );

    res.json({ message: "User and their group memberships removed!" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(400).json({ message: "Invalid ID format" });
  } finally {
    close();
  }
});

module.exports = router;
