const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.post("/", async (req, res) => {
  await connect();
  const { groupId, name } = req.body; // Get the group's ID and channel's name from the request

  const newChannel = {
    _id: new ObjectId(),
    name: name,
  };

  // Insert the new channel into the 'channels' collection
  await db().collection("channels").insertOne(newChannel);

  // Push the new channel's ID to the group's channels array
  await db()
    .collection("groups")
    .updateOne(
      { _id: new ObjectId(groupId) }, // Use ObjectId here
      { $push: { channels: newChannel._id.toString() } }
    );

  res.json({ message: "Channel created!" });
  close();
});

router.get("/", async (req, res) => {
  await connect();

  try {
    const channels = await db().collection("channels").find({}).toArray();
    res.json(channels);
  } catch (err) {
    console.error("Error fetching channels:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    close();
  }
});

router.delete("/:channelId", async (req, res) => {
  await connect();
  const channelId = new ObjectId(req.params.channelId);

  // Remove the channel from the 'channels' collection
  await db().collection("channels").deleteOne({ _id: channelId });

  // Pull the channel's ID from all groups' channels arrays
  await db()
    .collection("groups")
    .updateMany(
      { channels: channelId.toString() },
      { $pull: { channels: channelId.toString() } }
    );

  res.json({ message: "Channel deleted!" });
  close();
});
module.exports = router;
