const express = require("express");
const Product = require("../models/Product");

// -------- Security helpers --------
const ALLOWED_SORT = [
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc"
];

function sanitizeString(value) {
  if (typeof value !== "string") return undefined;
  return value.replace(/[${}]/g, "").trim();
}

function sanitizeNumber(value, def) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : def;
}

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

// READ ALL (with filters & sorting): GET /products
router.get("/", async (req, res) => {
  try {
    const rawCategory = req.query.category;
    const rawMin = req.query.min;
    const rawMax = req.query.max;
    const rawSort = req.query.sort;
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;

    const category = sanitizeString(rawCategory);

    const min = sanitizeNumber(rawMin, undefined);
    const max = sanitizeNumber(rawMax, undefined);

    const sort = ALLOWED_SORT.includes(rawSort) ? rawSort : undefined;

    const pageNumber = Math.max(sanitizeNumber(rawPage, 1), 1);
    const limitNumber = Math.min(Math.max(sanitizeNumber(rawLimit, 8), 1), 50); // hard cap
    const skip = (pageNumber - 1) * limitNumber;

    // -------- FILTER --------
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (min !== undefined || max !== undefined) {
      filter.price = {};
      if (min !== undefined) filter.price.$gte = min;
      if (max !== undefined) filter.price.$lte = max;
    }

    // -------- SORT --------
    let sortOption = { createdAt: -1 };

    if (sort === "price-asc") sortOption = { price: 1 };
    else if (sort === "price-desc") sortOption = { price: -1 };
    else if (sort === "name-asc") sortOption = { name: 1 };
    else if (sort === "name-desc") sortOption = { name: -1 };

    const items = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    return res.json(items);

  } catch (err) {
    console.error(err);
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
