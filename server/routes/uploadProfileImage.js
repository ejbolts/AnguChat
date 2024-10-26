const AWS = require("aws-sdk");
const express = require("express");
const router = express.Router();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const { connect, db, close } = require("./app");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();


const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
});




router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file; // File is available in req.file
  const uniqueFileName = `${Date.now()}_${file.originalname}`;
  console.log("uniqueFileName:", uniqueFileName);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: uniqueFileName,
    Body: fs.createReadStream(file.path),
  };

  s3.upload(params, async function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      const imageUrl = data.Location;
      console.log("imageUrl:", imageUrl);



      const moderationParams = {
        Image: {
          S3Object: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Name: uniqueFileName,
          },
        },
        MinConfidence: 70,
      };

      // Call Rekognition for moderation labels
      const moderationResult = await rekognition.detectModerationLabels(moderationParams).promise();
      console.log('Moderation Labels:', moderationResult.ModerationLabels);

      // Check if any moderation labels are found
      if (moderationResult.ModerationLabels.length > 0) {
        console.log('Inappropriate content detected. Deleting image from S3...');

        // Delete the image from S3
        await s3.deleteObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: uniqueFileName }).promise();
        console.log('Image deleted due to inappropriate content.');
        res.json({ deletedIMG: true });
        return { deleted: true, labels: moderationResult.ModerationLabels };
      }
      res.json({ message: "File uploaded successfully", data, deletedIMG: false });


      const username = req.body.username;
      console.log("username:", username);
      try {
        await connect();
        // Update the user's profile picture URL in the database
        const updatedUser = await db()
          .collection("users")
          .findOneAndUpdate(
            { username: username },
            { $set: { profilePic: imageUrl } },
            { returnDocument: "after" }
          );

        close();
      } catch (updateError) {
        console.error("Error updating user profile picture:", updateError);
      }
      // If no moderation labels found, return the moderation result
    }
  });
});

module.exports = router;

