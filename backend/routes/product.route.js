import express from 'express';
import { getProducts, getTrendingProducts, getProductByCategory, getProductById, getProductReviews } from '../controllers/product.controller.js';

const router = express.Router();

router.get("/", getProducts);
router.get("/trending", getTrendingProducts);
router.get("/:id", getProductById);
router.get("/category/:id", getProductByCategory);
router.get("/reviews/:id", getProductReviews);

export default router;