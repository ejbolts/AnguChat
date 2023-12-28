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

router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file; // File is available in req.file
  const uniqueFileName = `${Date.now()}_${file.originalname}`;
  console.log("uniqueFileName:", uniqueFileName);

  const params = {
    Bucket: "text-video-app-images-872342",
    Key: uniqueFileName, // Use the unique filename here
    Body: fs.createReadStream(file.path),
  };

  s3.upload(params, async function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send({ message: "File uploaded successfully", data });
      const imageUrl = data.Location;
      console.log("imageUrl:", imageUrl);

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
        res.status(500).send(updateError);
      }
    }
  });
});

module.exports = router;
