const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.post("/create", async (req, res) => {
  await connect();
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

// Add user to group
router.post("/:groupId/addUser", async (req, res) => {
  await connect();

  const groupId = new ObjectId(req.params.groupId);
  const { userId } = req.body;

  try {
    await db()
      .collection("groups")
      .updateOne({ _id: groupId }, { $addToSet: { users: userId } });
    res.json({ message: "User added to group!" });
  } catch (err) {
    console.error("Error adding user to group:", err);
    res.status(500).json({ message: "Error adding user to group." });
  } finally {
    close();
  }
});

// Remove user from group
router.post("/:groupId/removeUser", async (req, res) => {
  await connect();

  const groupId = new ObjectId(req.params.groupId);
  const { userId } = req.body;

  try {
    await db()
      .collection("groups")
      .updateOne({ _id: groupId }, { $pull: { users: userId } });
    res.json({ message: "User removed from group!" });
  } catch (err) {
    console.error("Error removing user from group:", err);
    res.status(500).json({ message: "Error removing user from group." });
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

  // Fetch the group to get its channels
  const group = await db().collection("groups").findOne({ _id: groupId });

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  // Remove the group from groups collection
  await db().collection("groups").deleteOne({ _id: groupId });

  // Convert the channels' IDs from strings to ObjectId for the deleteMany query
  const channelObjectIds = group.channels.map((id) => new ObjectId(id));

  // Remove all channels associated with the group from channels collection
  await db()
    .collection("channels")
    .deleteMany({ _id: { $in: channelObjectIds } });

  res.json({ message: "Group and its channels deleted successfully!" });
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

router.post("/:groupId/join", async (req, res) => {
  await connect();

  const groupId = new ObjectId(req.params.groupId);
  const userId = req.body.userId;

  try {
    const group = await db().collection("groups").findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    // Check if user is already a member or has already requested to join
    if (group.users?.includes(userId) || group.pendingUsers?.includes(userId)) {
      return res.status(400).json({
        message: "User is already a member or has already requested to join.",
      });
    }

    // Add the user to the pendingUsers array
    await db()
      .collection("groups")
      .updateOne(
        { _id: groupId },
        { $addToSet: { pendingUsers: userId } } // $addToSet ensures no duplicates
      );

    res.json({ message: "Join request sent!" });
  } catch (err) {
    console.error("Error processing join request:", err);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    close();
  }
});

router.post("/:groupId/approveUser", async (req, res) => {
  await connect();

  const groupId = new ObjectId(req.params.groupId);
  const userId = req.body.userId;

  try {
    const group = await db().collection("groups").findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    if (!group.pendingUsers?.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User has not requested to join this group." });
    }

    // Move the user from pendingUsers to users
    await db()
      .collection("groups")
      .updateOne(
        { _id: groupId },
        {
          $addToSet: { users: userId }, // Add user to users array
          $pull: { pendingUsers: userId }, // Remove user from pendingUsers array
        }
      );

    res.json({ message: "User approved and added to group!" });
  } catch (err) {
    console.error("Error processing approval:", err);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    close();
  }

});
router.get("/:groupId/Users", async (req, res) => {
  const groupId = req.params.groupId;
  await connect();
  try {
    const group = await db().collection("groups").findOne({ _id: new ObjectId(groupId) });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const users = await db().collection("users").find({
      _id: { $in: group.users.map(userId => new ObjectId(userId)) }
    }).toArray();

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
