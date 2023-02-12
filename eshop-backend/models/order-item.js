import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
});

export const OrderItem = mongoose.model("OrderItems", orderItemSchema);
