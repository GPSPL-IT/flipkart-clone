import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import Review from "../models/review.model.js";

// get all products with filters
export const getProducts = async (req, res) => {
    try {
        const { keyword, category, priceMin, priceMax, rating, brand, sort } = req.query;
        const query = {};

        // Keyword search (title, description, brand)
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { brand: { $regex: keyword, $options: "i" } }
            ];
        }

        // Category filter (handles slug by finding matching Category object first)
        if (category) {
            const foundCategory = await Category.findOne({ slug: category });
            if (foundCategory) {
                // Find potential subcategories
                const subCategories = await Category.find({ parentCategory: foundCategory._id });
                const categoryIds = [foundCategory._id, ...subCategories.map(c => c._id)];
                query.category = { $in: categoryIds };
            } else {
                // If slug not found, force empty result query
                query.category = null;
            }
        }

        // Brand filter (comma separated)
        if (brand) {
            const brandsList = brand.split(",").map(b => b.trim());
            query.brand = { $in: brandsList.map(b => new RegExp(`^${b}$`, "i")) };
        }

        // Price range
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin) query.price.$gte = Number(priceMin);
            if (priceMax) query.price.$lte = Number(priceMax);
        }

        // Ratings filter
        if (rating) {
            query.ratings = { $gte: Number(rating) };
        }

        // Sort configuration
        let sortObj = {};
        if (sort === "priceAsc") {
            sortObj = { price: 1 };
        } else if (sort === "priceDesc") {
            sortObj = { price: -1 };
        } else if (sort === "rating") {
            sortObj = { ratings: -1 };
        } else {
            sortObj = { createdAt: -1 };
        }

        const pageSize = Math.min(Number(req.query.limit) || 12, 50);
        const page = Math.max(Number(req.query.page) || 1, 1);

        const [count, products] = await Promise.all([
            Product.countDocuments(query),
            Product.find(query)
                .populate("category", "name slug")
                .sort(sortObj)
                .limit(pageSize)
                .skip(pageSize * (page - 1))
                .lean()
        ]);

        // Get unique brands list matching current filters (excluding current brand filter itself for better UX)
        const brandsQuery = { ...query };
        delete brandsQuery.brand;
        const brands = await Product.distinct("brand", brandsQuery);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products,
            page,
            pages: Math.ceil(count / pageSize),
            totalProducts: count,
            brands
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};

// get trending, featured, and top-rated products for the homepage
export const getTrendingProducts = async (req, res) => {
    try {
        const [trending, featured, topRated] = await Promise.all([
            Product.find({ isTrending: true }).limit(8).populate("category", "name slug").lean(),
            Product.find({ isFeatured: true }).limit(8).populate("category", "name slug").lean(),
            Product.find({ ratings: { $gte: 4 } }).sort({ ratings: -1 }).limit(8).populate("category", "name slug").lean()
        ]);

        // Fallbacks if db doesn't have these flags set yet
        const fallback = await Product.find({}).limit(8).populate("category", "name slug").lean();

        return res.status(200).json({
            success: true,
            trending: trending.length > 0 ? trending : fallback,
            featured: featured.length > 0 ? featured : fallback,
            topRated: topRated.length > 0 ? topRated : fallback
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
            .populate("category", "name slug");

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Fetch related products (same category, exclude current)
        const relatedProducts = await Product.find({
            category: product.category?._id,
            _id: { $ne: product._id },
        })
            .limit(4)
            .populate('category', 'name slug')
            .lean();

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product,
            relatedProducts
        });
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