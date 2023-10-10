const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.delete("/:id", async (req, res) => {
  console.log("Received delete request for user ID:", req.params.id); // Log the received user ID

  await connect();
  try {
    const userId = new ObjectId(req.params.id);
    await db().collection("users").deleteOne({ _id: userId });
    res.json({ message: "User removed!" });
  } catch (err) {
    console.error("Error deleting user:", err);
    return res.status(400).json({ message: "Invalid ID format" });
  } finally {
    close();
  }
});

module.exports = router;
