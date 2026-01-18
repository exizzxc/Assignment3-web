const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// CREATE: POST /products
router.post("/", async (req, res) => {
  try {
    const created = await Product.create(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      error: err.message
    });
  }
});

// READ ALL: GET /products
router.get("/", async (req, res) => {
  try {
    const items = await Product.find().sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// READ ONE: GET /products/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Product not found" });
    return res.json(item);
  } catch (err) {
    return res.status(400).json({ message: "Invalid id format" });
  }
});

// UPDATE: PUT /products/:id
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Product not found" });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      error: err.message
    });
  }
});

// DELETE: DELETE /products/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    return res.status(400).json({ message: "Invalid id format" });
  }
});

module.exports = router;
