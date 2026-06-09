import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    gender: {
        type: String,
        require: false,
        enum: ["male", "female", "other"]
    },
    refreshToken: {
        type: String
    },
    address: [addressSchema],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    recentlyViewed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        }
    ]
},
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema)

export default User