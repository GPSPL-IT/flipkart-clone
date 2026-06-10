import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

// get all products 
export const getProducts = async (req, res) => {
    try {
        const pageSize = Math.min(Number(req.query.limit) || 12, 50); // Cap at 50 products per request
        const page = Math.max(Number(req.query.page) || 1, 1);  // Minimum page is 1

        const [count, products] = await Promise.all([
            Product.countDocuments({}),
            Product.find({})
                // .populate('category', 'name slug') 
                .limit(pageSize)
                .skip(pageSize * (page - 1))
                .lean()
        ]);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            page,
            pages: Math.ceil(count / pageSize),
            totalProducts: count,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
// get caregory product
export const getProductByCategory = async (req, res) => {
    try {
        const categories = await Category.find({}).populate('parentCategory', 'name slug');
        return res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            data: categories
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

// get single product
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        // .populate("category", "name slug").lean();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Fetch related products (same category, exclude current) in parallel
        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: product._id },
        })
            .limit(4)
            .populate('category', 'name slug')
            .lean();
        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: { product, relatedProducts }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

// get product review
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).sort({ createdAt: -1 }).lean()
        if (!reviews) {
            return res.status(404).json({ message: "Reviews not found" })
        }
        return res.status(200).json({
            success: true,
            message: "Reviews fetched successfully",
            reviews
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}