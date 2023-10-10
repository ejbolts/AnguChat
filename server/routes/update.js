const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.put("/:id", async (req, res) => {
  await connect();
  const productId = new ObjectId(req.params.id);
  const updatedProduct = req.body;

  await db()
    .collection("products")
    .updateOne({ _id: productId }, { $set: updatedProduct });
  res.json({ message: "Product updated!" });
  close();
});

module.exports = router;
