import Review from "../models/review.model.js";

// Create Review
export const createReview = async (req, res) => {
    try {
        const review = await Review.create(req.body);

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
        });

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