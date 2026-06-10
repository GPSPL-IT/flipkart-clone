import express from "express";
import Category from "../models/category.model.js";

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("parentCategory");
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch categories", error: error.message });
  }
});

export default router;
