import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';

// ────────────────────────────────────────────────────────
// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
// ────────────────────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all count queries in parallel for speed
    const [totalUsers, totalProducts, totalOrders, salesData, salesByMonth, recentOrders, lowStockProducts] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments(),
        Order.countDocuments(),

        // Total revenue from paid orders
        Order.aggregate([
          { $match: { isPaid: true } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),

        // Monthly revenue chart (last 6 months)
        Order.aggregate([
          { $match: { isPaid: true } },
          {
            $group: {
              _id:     { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              revenue: { $sum: '$totalPrice' },
              count:   { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 6 },
        ]),

        // 5 most recent orders
        Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),

        // Products with low/no stock
        Product.find({ stock: { $lt: 5 } })
          .select('title brand stock price')
          .limit(5),
      ]);

    return res.json({
      counts: {
        users:    totalUsers,
        products: totalProducts,
        orders:   totalOrders,
        sales:    Math.round(salesData[0]?.total ?? 0),
      },
      chartData: salesByMonth.map((item) => ({
        month:   item._id,
        revenue: Math.round(item.revenue),
        orders:  item.count,
      })),
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Admin
// ────────────────────────────────────────────────────────
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Update order status + send notifications
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
// ────────────────────────────────────────────────────────
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, description } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.status;
    order.status = status;

    // Append new tracking event to history
    order.trackingHistory.push({
      status,
      description: description || `Order status updated to ${status}.`,
      timestamp:   new Date(),
    });

    // Handle Delivered status — mark paid (for COD) and award Supercoins
    if (status === 'Delivered' && prevStatus !== 'Delivered') {
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
      }

      const coinsEarned = Math.floor(order.totalPrice / 50); // ₹50 = 1 coin
      if (coinsEarned > 0) {
        const customer = await User.findById(order.user);
        if (customer) {
          customer.supercoins += coinsEarned;
          await customer.save();

          await Notification.create({
            user:    customer._id,
            title:   'Supercoins Credited!',
            message: `You earned ${coinsEarned} Supercoins for order #${order._id}. Balance: ${customer.supercoins} coins.`,
          });
        }
      }

      await Notification.create({
        user:    order.user,
        title:   'Order Delivered',
        message: `Order #${order._id} worth ₹${order.totalPrice} has been delivered successfully.`,
      });
    }

    // Notify user when order is shipped
    if (status === 'Shipped' && prevStatus !== 'Shipped') {
      await Notification.create({
        user:    order.user,
        title:   'Order Shipped',
        message: `Order #${order._id} has been shipped and is on the way!`,
      });
    }

    const updatedOrder = await order.save();
    return res.json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
// ────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Admin
// ────────────────────────────────────────────────────────
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, discountPercentage, images, category, brand, stock, specifications, isFeatured, isTrending } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(404).json({ message: 'Category not found' });

    const product = await Product.create({
      title,
      description,
      price,
      discountPercentage: discountPercentage || 0,
      images:             images?.length ? images : ['https://via.placeholder.com/400'],
      category,
      brand,
      stock,
      specifications:     specifications || [],
      isFeatured:         isFeatured     || false,
      isTrending:         isTrending     || false,
    });

    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Admin
// ────────────────────────────────────────────────────────
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Validate category if it's being changed
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) return res.status(404).json({ message: 'Category not found' });
    }

    // Only update fields that were provided in the request body
    const allowedFields = ['title', 'description', 'price', 'discountPercentage', 'images', 'category', 'brand', 'stock', 'specifications', 'isFeatured', 'isTrending'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    const updatedProduct = await product.save();
    return res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Admin
// ────────────────────────────────────────────────────────
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    return res.json({ message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct,
};
