const Product  = require('../models/Product');
const Category = require('../models/Category');
const Review   = require('../models/Review');

// Sort option map — avoids repeated if/else chains
const SORT_MAP = {
  priceAsc:  { price: 1 },
  priceDesc: { price: -1 },
  rating:    { ratings: -1 },
  newest:    { createdAt: -1 },
};

// ────────────────────────────────────────────────────────
// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
// ────────────────────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).populate('parentCategory', 'name slug');
    return res.json(categories);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get products with filters, sorting, and pagination
// @route   GET /api/products?keyword&category&brand&priceMin&priceMax&rating&sort&page&limit
// @access  Public
// ────────────────────────────────────────────────────────
const getProducts = async (req, res, next) => {
  try {
    const pageSize = Math.min(Number(req.query.limit) || 12, 50); // cap at 50
    const page     = Math.max(Number(req.query.page)  || 1,  1);  // minimum 1
    const query    = {};

    // 1. Keyword search — matches title, brand, or description
    if (req.query.keyword) {
      const regex = { $regex: req.query.keyword, $options: 'i' };
      query.$or = [{ title: regex }, { brand: regex }, { description: regex }];
    }

    // 2. Category filter — supports slug, name, or ObjectId
    if (req.query.category) {
      const cat = await Category.findOne({
        $or: [{ slug: req.query.category }, { name: req.query.category }],
      }).lean();

      if (cat) {
        // Include parent + all its sub-categories
        const subCats = await Category.find({ parentCategory: cat._id }, '_id').lean();
        query.category = { $in: [cat._id, ...subCats.map((s) => s._id)] };
      } else if (/^[0-9a-fA-F]{24}$/.test(req.query.category)) {
        // Direct ObjectId match
        query.category = req.query.category;
      }
    }

    // 3. Price range filter
    if (req.query.priceMin || req.query.priceMax) {
      query.price = {};
      if (req.query.priceMin) query.price.$gte = Number(req.query.priceMin);
      if (req.query.priceMax) query.price.$lte = Number(req.query.priceMax);
    }

    // 4. Brand filter — comma-separated, case-insensitive
    if (req.query.brand) {
      const brands = req.query.brand.split(',').map((b) => new RegExp(`^${b.trim()}$`, 'i'));
      query.brand = { $in: brands };
    }

    // 5. Minimum rating filter
    if (req.query.rating) {
      query.ratings = { $gte: Number(req.query.rating) };
    }

    const sort = SORT_MAP[req.query.sort] || SORT_MAP.newest;

    // Run count and product fetch in parallel for speed
    const [count, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sort)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .lean(), // lean() returns plain JS objects — faster, less memory
    ]);

    // Only fetch distinct brands when the client asks for them
    // (e.g. on the filter sidebar initial load — pass ?includeBrands=true)
    const brands = req.query.includeBrands === 'true'
      ? await Product.distinct('brand')
      : undefined;

    return res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
      ...(brands && { brands }),
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get single product by ID + related products
// @route   GET /api/products/:id
// @access  Public
// ────────────────────────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Fetch related products (same category, exclude current) in parallel
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id:      { $ne: product._id },
    })
      .limit(4)
      .populate('category', 'name slug')
      .lean();

    return res.json({ product, relatedProducts });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
// ────────────────────────────────────────────────────────
const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .sort({ createdAt: -1 })
      .lean();
    return res.json(reviews);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Create a review for a product
// @route   POST /api/products/:id/reviews
// @access  Private
// ────────────────────────────────────────────────────────
const createProductReview = async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // One review per user per product (enforced by DB unique index on Review model too)
    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      product:  productId,
      user:     req.user._id,
      name:     req.user.name,
      rating:   Number(rating),
      title,
      comment,
    });

    return res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get trending, featured, and top-rated products
// @route   GET /api/products/trending
// @access  Public
// ────────────────────────────────────────────────────────
const getTrendingProducts = async (req, res, next) => {
  try {
    // Run all three queries in parallel — much faster than sequential awaits
    const [trending, featured, topRated] = await Promise.all([
      Product.find({ isTrending: true }).limit(6).populate('category', 'name slug').lean(),
      Product.find({ isFeatured: true }).limit(6).populate('category', 'name slug').lean(),
      Product.find({ ratings: { $gte: 4 } })
        .sort({ ratings: -1 })
        .limit(6)
        .populate('category', 'name slug')
        .lean(),
    ]);

    return res.json({ trending, featured, topRated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getProducts,
  getProductById,
  getProductReviews,
  createProductReview,
  getTrendingProducts,
};
