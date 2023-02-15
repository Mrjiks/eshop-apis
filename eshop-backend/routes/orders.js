import { Order } from "../models/order.model.js";
import express from "express";
import { OrderItem } from "../models/order-item.js";

const router = express.Router();

//? APIs Endpoints
//!-----Get all orders api------
router.get(`/`, async (req, res) => {
  const orderList = await Order.find().populate("user", "name").sort({ dateOrdered: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//!-----Get one order api------
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: "product",
      populate: {
        path: "product",
        populate: "category",
      },
    });

  if (!order) {
    res.status(500).json({ success: false, message: "Order does not exist" });
  }
  res.send(order);
});

//!-----Place an order api------

router.post("/", async (req, res) => {
  // Create orderItems from users placed orders and saved to the database
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();

      // returns only orderItem Ids to be used in placed orders
      return newOrderItem._id;
    })
  );
  const orderItemsIdsResolved = await orderItemsIds;

  // Calculates orders based on the orderItems Ids
  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate("product", "price");
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });
  order = await order.save();

  if (!order) return res.status(400).send("the order cannot be created!");

  res.send(order);
});

//! Update order
router.put("/:id", async (req, res) => {
  try {
    const updateOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );
    res.status(201).json(updateOrder);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

//! Delete order
router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res.status(200).json({ success: true, message: "the order is deleted!" });
      } else {
        return res.status(404).json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

//! Order Stats

router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);
    res.json({
      totalSale: totalSales.pop().totalsales,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Order total sales cannot be computed" });
  }
});

//! Order count stats
router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments((count) => count);
    res.json({
      OrderCount: orderCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//! Get user orderList /history

router.get(`/get/userorders/:userid`, async (req, res) => {
  try {
    const userOrderList = await Order.find({ user: req.params.userid })
      .populate({
        path: "orderItems",
        populate: {
          path: "product",
          populate: "category",
        },
      })
      .sort({ dateOrdered: -1 });

    res.send({ totalOrders: userOrderList.length, userOrderList: userOrderList });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

export default router;
