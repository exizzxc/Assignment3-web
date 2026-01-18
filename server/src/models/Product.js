const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true
    },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    }
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model("Product", productSchema);
