const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },
                quantity: Number,
                price: Number,
            },
        ],

        shippingAddress: {
            address: String,
            city: String,
            state: String,
            pincode: String,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            default: "COD",
        },

        orderStatus: {
            type: String,
            default: "Pending",
            enum: [
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
            ],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);