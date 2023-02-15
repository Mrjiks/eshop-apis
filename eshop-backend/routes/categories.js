import { Category } from "../models/category.model.js";
import express from "express";

const router = express.Router();

//! CATEGORY API endpoints

//? Get all categories
router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

//? Get one category
router.get("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(500).json({
      success: false,
      error: "Cannot find category with that id",
    });
  }
  res.status(200).send(category);
});

//? Post category
router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
  });
  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});
//? Update category
router.put("/:id", async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon,
      },
      { new: true }
    );
    res.status(201).json(updatedCategory);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

//? Delete category
router.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: "Deleted Successfully",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
    })
    .catch((error) => {
      return res.status(404).json({
        success: false,
        error,
      });
    });
});
export default router;
