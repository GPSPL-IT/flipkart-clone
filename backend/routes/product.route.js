import express from 'express';
import { getProducts, getTrendingProducts, getProductByCategory, getProductById } from '../controllers/product.controller.js';

const router = express.Router();

// Static/specific routes MUST come before dynamic /:id to avoid conflicts
router.get("/", getProducts);
router.get("/trending", getTrendingProducts);
router.get("/category/:id", getProductByCategory);

// Dynamic route last
router.get("/:id", getProductById);

export default router;