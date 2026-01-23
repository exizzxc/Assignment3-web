const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const productRoutes = require("./routes/products");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
          "https://cdnjs.cloudflare.com"
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
        connectSrc: [
          "'self'",
          "https://cdn.jsdelivr.net"
        ]
      }
    }
  })
);

app.use(cors());
app.use(express.json());

const path = require("path");
app.use(express.static(path.join(__dirname, "../public")));

// Rate limiting (API protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP
  standardHeaders: true,
  legacyHeaders: false
});

// Подключение MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Роуты
app.use("/products", apiLimiter, productRoutes);

// Health-check
app.get("/", (req, res) => {
  res.json({ message: "ElectroShop API is running" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
