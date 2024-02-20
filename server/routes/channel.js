const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;
const Filter = require('bad-words'),

  filter = new Filter();
router.post("/", async (req, res) => {
  await connect();
  const { groupId, name, userId } = req.body;

  const newChannel = {
    _id: new ObjectId(),
    name: name,
    history: [],
    users: [userId],
  };

  // Insert the new channel into the 'channels' collection
  await db().collection("channels").insertOne(newChannel);

  // Push the new channel's ID to the group's channels array
  await db()
    .collection("groups")
    .updateOne(
      { _id: new ObjectId(groupId) },
      { $push: { channels: newChannel._id.toString() } }
    );

  res.json({ message: "Channel created!", _id: newChannel._id });
  close();
});

router.post("/:channelId/addUser", async (req, res) => {
  await connect();
  const channelId = new ObjectId(req.params.channelId);
  const { groupId, userId } = req.body;

  const group = await db()
    .collection("groups")
    .findOne({ _id: new ObjectId(groupId) });

  if (!group) {
    return res.status(404).json({
      message: "Group not found.",
    });
  }

  if (!group.channels.includes(channelId.toString())) {
    return res.status(400).json({
      message: "Channel not part of the specified group.",
    });
  }

  if (!group.users.includes(userId)) {
    return res.status(400).json({
      message: "User is not part of the specified group.",
    });
  }

  await db()
    .collection("channels")
    .updateOne(
      { _id: channelId },
      { $addToSet: { users: userId } } // $addToSet to ensure no duplicates
    );

  res.json({ message: "User added to channel!" });
  close();
});

router.delete("/:channelId/removeUser", async (req, res) => {
  let channelId;
  try {
    channelId = new ObjectId(req.params.channelId);
  } catch (error) {
    // This catches cases where ObjectId conversion fails (invalid format)
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    await connect();

    // Check if the channel exists
    const channelExists = await db().collection("channels").findOne({ _id: channelId });
    if (!channelExists) {
      return res.status(404).json({ message: "Channel not found." });
    }

    const { userId } = req.body;

    // Remove the user from the channel's users array
    await db()
      .collection("channels")
      .updateOne({ _id: channelId }, { $pull: { users: userId } });

    res.json({ message: "User removed from channel!" });
  } catch (error) {
    console.error("Error removing user from channel:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    close();
  }
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
  }
});

router.get("/getAllUsers", async (req, res) => {
  await connect();

  try {
    const users = await db().collection("users").find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
  }
});

router.delete("/:channelId", async (req, res) => {
  try {
    await connect();
    console.log("Database connection established");
    console.log("req.params.channelId", req.params.channelId)

    const channelId = new ObjectId(req.params.channelId);
    console.log(`Attempting to delete channel with ID: ${channelId}`);

    // Remove the channel from the 'channels' collection
    const deleteResult = await db().collection("channels").deleteOne({ _id: channelId });
    console.log(`Channel delete result: ${JSON.stringify(deleteResult)}`);

    // Pull the channel's ID from all groups' channels arrays
    const updateResult = await db()
      .collection("groups")
      .updateMany(
        { channels: channelId.toString() },
        { $pull: { channels: channelId.toString() } }
      );
    console.log(`Groups update result: ${JSON.stringify(updateResult)}`);

    res.json({ message: "Channel deleted!" });
  } catch (err) {
    console.error("Error processing channel deletion:", err);
    res.status(500).json({ message: "Error deleting channel." });
  } finally {
    close();
    console.log("Database connection closed");
  }
});

router.post("/:channelId/addMessage", async (req, res) => {
  try {
    console.log("CSRF token received in headers:", req.headers["csrf-token"]);

    await connect();
    const channelId = new ObjectId(req.body.channelId);
    const { message } = req.body;
    message.content = filter.clean(message.content)
    console.log("channelID and message.content:", channelId, message);

    await db()
      .collection("channels")
      .updateOne({ _id: channelId }, { $addToSet: { history: message } });

    res.json({ message: "Message added to channel!" });
  } catch (error) {
    console.error("Error adding message to channel:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the message." });
  } finally {
    close();
  }
});

router.post("/:channelId/updateMessage", async (req, res) => {
  try {
    console.log("CSRF token received in headers:", req.headers["csrf-token"]);
    await connect();
    let messageContent = req.body.messageContent;
    messageContent = filter.clean(messageContent)

    await db()
      .collection("channels")
      .updateOne(
        { "history.id": req.body.messageId },
        { $set: { "history.$.content": messageContent, "history.$.isEdited": true } }
      )

    res.json({ message: "Message updated to channel", isEdited: true });
  } catch (error) {
    console.error("Error updating message to channel history:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the message." });
  } finally {
    close();
  }
});

router.post("/:channelId/deleteMessage", async (req, res) => {
  try {
    console.log("CSRF token received in headers:", req.headers["csrf-token"]);
    await connect();
    console.log("req.body in deleteMessage:", req.body);

    // Use the $pull operator to remove the message from the history array
    const result = await db().collection("channels").updateOne(
      { _id: new ObjectId(req.params.channelId) }, // Ensure correct matching of channelId
      { $pull: { history: { id: req.body.messageId } } } // Remove the specific message
    );

    if (result.modifiedCount === 0) {
      console.log("No message found with given ID in the specified channel.");
      return res.status(404).json({ message: "Message not found." });
    }

    res.json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message from channel history:", error);
    res.status(500).json({ error: "An error occurred while deleting the message." });
  } finally {
    close();
  }
});

module.exports = router;
