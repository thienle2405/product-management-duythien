const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user_id: String, 
    cart_id: String,
    userInfo: {
      fullName: String,
      phone: String,
      address: String,
    },
    products: [
      {
        product_id: String,
        price: Number,
        discountPercentage: Number,
        quantity: Number,
      }
    ],
    status: {
      type: String,
      default: "pending",
    },
    deleted: {
      type: Boolean,
      default: false,
      unique: false,
    },
    // deletedAt: Date,
    deletedBy: {
      account_id: String,
      deletedAt: Date,
    },
    updatedBy: [
      {
        account_id: String,
        updatedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
