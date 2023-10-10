const express = require("express");
const router = express.Router();
const { connect, db, close } = require("./app");
const ObjectId = require("mongodb").ObjectId;

router.delete("/:id", async (req, res) => {
  await connect();
  try {
    const productId = new ObjectId(req.params.id);
    await db().collection("products").deleteOne({ _id: productId });
    res.json({ message: "Product removed!" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  close();
});

module.exports = router;
