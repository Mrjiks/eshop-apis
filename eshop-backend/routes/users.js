import { User } from "../models/user.model.js";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();

router.get(`/`, async (req, res) => {
  const userList = await User.find();

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

// Get one user
router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res.status(500).json({
      success: false,
      error: "Cannot find user with that id",
    });
  }
  res.status(200).send(user);
});

// Create a  create user api
router.post("/", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
    passwordHash: bcrypt.hashSync(req.body.password, 3),
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({
      message: "User cannot created",
    });
  }
});

// Register user
router.post("/register", async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({
      message: "User cannot created",
    });
  }
});

//! User Login and Token Access
router.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    res.status(400).send("User is not found");
  }

  // Give token access to new user after a successful  login
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    // send user email and token info
    res.status(200).json({
      email: user.email,
      token: token,
    });
  } else {
    res.status(400).send("Password is not correct");
  }
});

//! Update a user
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId) {
    return res.status(400).send("Invalid user id");
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
      },
      { new: true }
    );
    res.status(201).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: "Invalid User Id",
    });
  }
});

//! Delete a user
router.delete("/:id", (req, res) => {
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res.status(200).json({
          success: true,
          message: "User Deleted Successfully",
        });
      } else {
        return res.status(404).send({
          success: false,
          message: "User not found",
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

//? ------------Special End points : Filtering data-----------------

//! 1. Get the total number of product
router.get("/get/count", async (req, res) => {
  try {
    const userCount = await User.countDocuments((count) => count);
    res.json({
      userCount: userCount,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
