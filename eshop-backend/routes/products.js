import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";

//! File Upload: Multer Library config
// Accepted file type extensions
const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// !----------router instantiation--------------
const router = express.Router();

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
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");

  // checking availability of image while posting new product
  const file = req.file;
  if (!file) return res.status(400).send("No image in the request");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();

  if (!product) return res.status(500).send("The product cannot be created");

  res.send(product);
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

//! Multiple file uploads :need some fixing
router.put(
  "/gallery-images/:id",
  uploadOptions.array([{ name: "images", maxCount: 10 }]),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if (files) {
      files.map((file) => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product) return res.status(500).send("the gallery cannot be updated!");

    res.send(product);
  }
);

export default router;
