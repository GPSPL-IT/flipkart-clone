import express from "express";
import protect from "../middleware/auth.middleware.js";
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// All order routes require authentication
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// Admin Routes (protect applied — adminOnly can be added if needed)
router.get("/", protect, getAllOrders);

// Must be after /my-orders to avoid param conflict
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, updateOrderStatus);

export default router;