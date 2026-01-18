const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/products");

const app = express();

app.use(cors());
app.use(express.json());


const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

// Подключение MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Роуты
app.use("/products", productRoutes);

// Health-check
app.get("/", (req, res) => {
  res.json({ message: "ElectroShop API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
