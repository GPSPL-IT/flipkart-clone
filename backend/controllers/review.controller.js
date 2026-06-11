import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

// Create Review
export const createReview = async (req, res) => {
    try {
        const { rating, title, comment, productId } = req.body;

        // productId can come from body or query param
        const resolvedProductId = productId || req.query.productId;

        if (!resolvedProductId) {
            return res.status(400).json({ success: false, message: "Product ID is required" });
        }

        const product = await Product.findById(resolvedProductId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Fetch user name to store in review for display
        const user = await User.findById(req.userId).select("name");

        const review = await Review.create({
            rating,
            title: title || "",
            comment,
            product: resolvedProductId,
            user: req.userId,
            name: user?.name || "Anonymous",
        });

        res.status(201).json({
            success: true,
            message: "Review added successfully",
            review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Reviews of Product
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            reviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Review
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};