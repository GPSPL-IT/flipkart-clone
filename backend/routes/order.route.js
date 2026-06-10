import express from "express"
const router = express.Router();

import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} from "../controllers/order.controller.js"

// User Routes
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

// Admin Routes
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

export default router;