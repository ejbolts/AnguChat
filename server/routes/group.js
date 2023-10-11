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

// In your route handler for deleting a channel

router.delete("/:id", async (req, res) => {
  await connect();

  const channelId = new ObjectId(req.params.id);

  // Remove from channels collection
  await db().collection("channels").deleteOne({ _id: channelId });

  // Remove from all group's channels array
  await db()
    .collection("groups")
    .updateMany({}, { $pull: { channels: { _id: channelId } } });

  res.json({ message: "Channel deleted successfully!" });
  close();
});

router.post("/:groupId/channel", async (req, res) => {
  try {
    await connect();
    const groupId = new ObjectId(req.params.groupId);
    const channel = {
      _id: new ObjectId(),
      name: req.body.name,
      users: [],
      bannedUsers: [],
    };

    // Add to channels collection
    await db().collection("channels").insertOne(channel);

    // Add to the group's channels array
    await db()
      .collection("groups")
      .updateOne({ name: groupName }, { $push: { channels: channel } });
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/:groupId/channels", async (req, res) => {
  console.log("Attempting to fetch channels for group ID:", req.params.groupId); // Log the incoming groupId

  await connect();
  const groupId = new ObjectId(req.params.groupId);

  const group = await db().collection("groups").findOne({ _id: groupId });
  if (!group) {
    console.log("No group found for ID:", req.params.groupId); // Log if no group found
    return res.status(404).json({ message: "Group not found" });
  } else {
    console.log("Found group:", group); // Log the found group
  }

  const channels = await db()
    .collection("channels")
    .find({ _id: { $in: group.channels.map((id) => new ObjectId(id)) } })
    .toArray();

  if (channels.length === 0) {
    console.log("No channels found for group ID:", req.params.groupId); // Log if no channels found
  } else {
    console.log("Channels found for group:", channels); // Log the found channels
  }

  res.json(channels);
  close();
});

module.exports = router;
