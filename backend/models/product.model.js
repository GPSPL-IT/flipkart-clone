import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    price: {
        type: Number,
        require: true
    },
    discountPrecentage: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        require: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require: true
    },
    brand: {
        type: String,
        require: true
    },
    stock: {
        type: Number,
        require: true
    },
    ratings: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "review"
    },

}, {
    timestamps: true
})
// creating index
productSchema.index({ title: "text", "description": "text" });

const Product = mongoose.model("Product", productSchema)

export default Product