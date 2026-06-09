import express from "express";

import {
    createReview,
    getProductReviews,
    deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Add Review
router.post("/", createReview);

// Get Reviews By Product
router.get("/product/:productId", getProductReviews);

// Delete Review
router.delete("/:id", deleteReview);

export default router;