const express = require("express");
const router = express.Router();

const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
} = require("../controllers/order.controller");

// User Routes
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

// Admin Routes
router.get("/", getAllOrders);
router.put("/:id/status", updateOrderStatus);

module.exports = router;