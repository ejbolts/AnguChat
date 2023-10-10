const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");

router.post("/create", async (req, res) => {
  await connect();

  const group = {
    name: req.body.name,
    channels: [],
    admins: [req.body.userId], // The user who creates the group becomes the admin.
    users: [req.body.userId], // Also add this user to the group members.
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

module.exports = router;
