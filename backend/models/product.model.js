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
    discountPercentage: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        require: true
    },
    images: {
        type: [String],
        default: []
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
    specifications: [
        {
            name: String,
            value: String
        }
    ],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isTrending: {
        type: Boolean,
        default: false
    },
    numReviews: {
        type: Number,
        default: 0
    },
    // reviews: {
    //     type: [mongoose.Schema.Types.ObjectId],
    //     ref: 'review'
    // },

}, {
    timestamps: true
})
// creating index
productSchema.index({ title: "text", "description": "text" });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isFeatured: 1 });

const Product = mongoose.model("Product", productSchema)

export default Product