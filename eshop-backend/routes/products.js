import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// router.get(`/`, async (req, res) => {
//   const productList = await Product.find();

//   if (!productList) {
//     res.status(500).json({ success: false });
//   }
//   res.send(productList);
// });

// Get all products
router.get("/", async (req, res) => {
  try {
    const productList = await Product.find().populate("category");
    res.json(productList);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Send only selection products fields
// router.get("/", async (req, res) => {
//   try {
//     const productList = await Product.find();
//     res.json(productList);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// });

// Get a single product
router.get("/:id", async (req, res) => {
  try {
    const singleProduct = await Product.findById(req.params.id).populate("category");
    res.json(singleProduct);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Post product to database using product model schema
router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    richDescription: req.body.richDescription,
    description: req.body.description,
    brand: req.body.brand,
    price: req.body.price,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    countInStock: req.body.countInStock,
    category: req.body.category,
  });
  try {
    // save created product to database
    const createdProduct = await product.save();
    // return response body with new saved product
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server error...",
    });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId) {
    return res.status(400).send("Invalid product id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: req.body.image,
        richDescription: req.body.richDescription,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        countInStock: req.body.countInStock,
        category: req.body.category,
      },
      { new: true }
    );
    res.status(201).json(updatedProduct);
  } catch (error) {
    res.status(500).json({
      message: "Invalid Product Id",
    });
  }
});

// Delete a product
router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res.status(200).json({
          success: true,
          message: "Deleted Successfully",
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "Product not found",
        });
      }
    })
    .catch((error) => {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    });
});

//? Special End points : Filtering data

//! 1. Get the total number of product
router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments((count) => count);
    res.json({
      productCount: productCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//! 2. Featured product endpoint
// Get the total number of product
router.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  try {
    const productFeatured = await Product.find({ isFeatured: true }).limit(Number(count));
    res.json({
      productFeatured: productFeatured,
      count: productFeatured.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//! Get product based on categories: query parameters

// so our endpoint : localhost:3000/api/v1/products?categories=23456,3995

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  try {
    const ProductList = await Product.find(filter).populate("category");
    res.send(ProductList);
    console.log(filter);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
