const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.post("/create", async (req, res) => {
  await connect();
  console.log(req.body);
  const group = {
    name: req.body.name,
    channels: [],
    admins: [req.body.userId],
    users: [req.body.userId],
  };

  try {
    const result = await db().collection("groups").insertOne(group);
    res.json({
      message: "Group created successfully!",
      groupId: result.insertedId,
    });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Error creating group." });
  } finally {
    close();
  }
});

router.get("/", async (req, res) => {
  await connect();

  try {
    const groups = await db().collection("groups").find({}).toArray();
    res.json(groups);
  } catch (err) {
    console.error("Error fetching groups:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    close();
  }
});

router.delete("/:id", async (req, res) => {
  await connect();
  const groupId = new ObjectId(req.params.id);

  try {
    const deleteResult = await db()
      .collection("groups")
      .deleteOne({ _id: groupId });

    if (deleteResult.deletedCount === 1) {
      res.json({ message: "Group deleted successfully!" });
    } else {
      res.status(404).json({ message: "Group not found!" });
    }
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    close();
  }
});
module.exports = router;
