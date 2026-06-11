import Order from "../models/order.model.js";

// Create Order
export const createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            paymentResult,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountAmount,
            totalPrice,
        } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: "No order items provided" });
        }

        if (!totalPrice) {
            return res.status(400).json({ success: false, message: "Total price is required" });
        }

        const order = await Order.create({
            user: req.userId,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || "COD",
            paymentResult: paymentResult || {},
            itemsPrice: itemsPrice || 0,
            taxPrice: taxPrice || 0,
            shippingPrice: shippingPrice || 0,
            discountAmount: discountAmount || 0,
            totalPrice,
            totalAmount: totalPrice, // legacy alias
            isPaid: paymentMethod !== "COD",
            paidAt: paymentMethod !== "COD" ? new Date() : undefined,
            orderStatus: "Pending",
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
            _id: order._id, // convenience alias for frontend
        });
    } catch (error) {
        console.error("Create order error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Logged-in User Orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.userId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Single Order
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin - Get All Orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Admin - Update Order Status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "Delivered") {
            order.isPaid = true;
            order.paidAt = new Date();
        }

        await order.save();

        res.status(200).json({
            success: true,
            message: "Order status updated",
            order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
