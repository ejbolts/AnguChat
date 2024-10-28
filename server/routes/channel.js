const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;
const Filter = require('bad-words');
const e = require("express");
const AWS = require("aws-sdk");
const s3 = new AWS.S3(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  }
);
const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
});

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
    res.json({ message: "Channel deleted!" });
  } catch (err) {
    console.error("Error processing channel deletion:", err);
    res.status(500).json({ message: "Error deleting channel." });
  } finally {
    close();
    console.log("Database connection closed");
  }
});




// Function to upload to S3 and then check with Rekognition
async function uploadAndModerateImage(base64String, bucketName = process.env.AWS_BUCKET_NAME,) {
  console.log('Uploading image to S3 and checking moderation labels...');

  // Generate date and unique filename
  const date = new Date().toISOString().split('T')[0];
  const uniqueId = Date.now();


  const key = `${date}_image_${uniqueId}.jpg`;
  if (base64String !== "") {

    // Remove the data URL prefix if it exists
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    // Decode the base64 image
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg'
    };

    try {
      await s3.upload(uploadParams).promise();
      console.log(`Image uploaded to S3 at https://${bucketName}.s3.ap-southeast-2.amazonaws.com/${key}`);
      const s3Url = `https://${bucketName}.s3.ap-southeast-2.amazonaws.com/${key}`

      // Set up Rekognition parameters with the S3 object location
      const moderationParams = {
        Image: {
          S3Object: {
            Bucket: bucketName,
            Name: key,
          },
        },
        MinConfidence: 80,
      };

      // Call Rekognition for moderation labels
      const moderationResult = await rekognition.detectModerationLabels(moderationParams).promise();
      console.log('Moderation Labels:', moderationResult.ModerationLabels);

      // Check if any moderation labels are found
      if (moderationResult.ModerationLabels.length > 0) {
        console.log('Inappropriate content detected. Deleting image from S3...');

        // Delete the image from S3
        await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
        console.log('Image deleted due to inappropriate content.');

        return { deleted: true, labels: moderationResult.ModerationLabels };
      }

      // If no moderation labels found, return the moderation result
      return { deleted: false, s3Url: s3Url };
    } catch (error) {
      console.error('Error during upload or moderation check:', error);
      throw error;
    }
  } else {
    console.log('No image data provided.');
  }
}


router.post("/:channelId/addMessage", async (req, res) => {
  try {
    console.log("CSRF token received in headers:", req.headers["csrf-token"]);

    await connect();
    const channelId = new ObjectId(req.body.channelId);
    const { message } = req.body;
    if (message.content !== "") {
      message.content = filter.clean(message.content)
    }

    if (message.image) {

      console.log('Moderating image...');
      const moderationResult = await uploadAndModerateImage(message.image);
      console.log('Moderation Result:', moderationResult);
      if (moderationResult.deleted) {
        console.log('Image was deleted due to moderation check.');
        message.image = 'inappropriate';
      } else {
        // update the message with the s3Url to store in db instead of the base64 string
        message.image = moderationResult.s3Url;
      }

    }


    console.log('passed moderation check');

    await db()
      .collection("channels")
      .updateOne({ _id: channelId }, { $addToSet: { history: message } });

    res.json({ message: message });
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
    await connect();
    console.log("req.body in deleteMessage:", req.body);

    // Find the message object with the image URL
    const channel = await db().collection("channels").findOne(
      { _id: new ObjectId(req.params.channelId) },
      { projection: { history: { $elemMatch: { id: req.body.messageId } } } }
    );

    if (!channel || !channel.history || channel.history.length === 0) {
      console.log("No message found with given ID in the specified channel.");
      return res.status(404).json({ message: "Message not found." });
    }

    const message = channel.history[0];


    // Use the $pull operator to remove the message from the history array
    const result = await db().collection("channels").updateOne(
      { _id: new ObjectId(req.params.channelId) }, // Ensure correct matching of channelId
      { $pull: { history: { id: req.body.messageId } } } // Remove the specific message
    );

    if (result.modifiedCount === 0) {
      console.log("No message found with given ID in the specified channel.");
      return res.status(404).json({ message: "Message not found." });
    }
    let imageKey = '';
    const imageUrl = message.image; // Extract the image URL
    if (imageUrl) {
      imageKey = imageUrl.split('/').pop(); // Extract the image key
      await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: imageKey }).promise();

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
