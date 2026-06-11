import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        orderItems: [orderItemSchema],

        shippingAddress: {
            name: String,
            street: String,
            city: String,
            state: String,
            zipCode: String,
            phone: String,
        },

        paymentMethod: {
            type: String,
            default: "COD",
        },

        paymentResult: {
            id: String,
            status: String,
            email_address: String,
        },

        itemsPrice: { type: Number, default: 0 },
        taxPrice: { type: Number, default: 0 },
        shippingPrice: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        totalPrice: { type: Number, required: true },

        // Keep legacy field for admin dashboard compatibility
        totalAmount: { type: Number },

        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },

        orderStatus: {
            type: String,
            default: "Pending",
            enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;