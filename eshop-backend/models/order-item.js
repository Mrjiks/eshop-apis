import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  product: {
    //linking to the Product table (collection)
    type: mongoose.Types.ObjectId,
    ref: "Product",
  },
});

export const OrderItem = mongoose.model("OrderItems", orderItemSchema);
