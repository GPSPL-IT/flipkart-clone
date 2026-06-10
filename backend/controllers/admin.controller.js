import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import Notification from "../models/notification.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, ordersData, recentOrders, lowStockProducts] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments(),
        Order.countDocuments(),
        Order.find().lean(),
        // 5 most recent orders
        Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5).lean(),
        // Products with low/no stock
        Product.find({ stock: { $lt: 5 } }).select('title brand stock price').limit(5).lean(),
      ]);

    // Calculate total sales
    const totalSales = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Group sales by month (last 6 months)
    const salesByMonthMap = {};
    ordersData.forEach(order => {
      if (order.createdAt) {
        const month = new Date(order.createdAt).toISOString().slice(0, 7); // "YYYY-MM"
        if (!salesByMonthMap[month]) {
          salesByMonthMap[month] = { revenue: 0, count: 0 };
        }
        salesByMonthMap[month].revenue += (order.totalAmount || 0);
        salesByMonthMap[month].count += 1;
      }
    });

    const salesByMonth = Object.keys(salesByMonthMap)
      .sort()
      .slice(-6)
      .map(month => ({
        _id: month,
        revenue: Math.round(salesByMonthMap[month].revenue),
        count: salesByMonthMap[month].count
      }));

    const mappedRecentOrders = recentOrders.map(o => ({
      ...o,
      totalPrice: o.totalAmount,
      status: o.orderStatus
    }));

    return res.json({
      counts: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        sales: Math.round(totalSales),
      },
      chartData: salesByMonth.map((item) => ({
        month: item._id,
        revenue: item.revenue,
        orders: item.count,
      })),
      recentOrders: mappedRecentOrders,
      lowStockProducts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const mappedOrders = orders.map(o => ({
      ...o,
      totalPrice: o.totalAmount,
      status: o.orderStatus
    }));

    return res.json(mappedOrders);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status + send notifications
// @route   PUT /api/admin/orders/:id/status
// @access  Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, description } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    // Handle Delivered status — mark paid (simulated) and award Supercoins
    if (status === 'Delivered' && prevStatus !== 'Delivered') {
      const coinsEarned = Math.floor(order.totalAmount / 50); // ₹50 = 1 coin
      if (coinsEarned > 0) {
        const customer = await User.findById(order.user);
        if (customer) {
          customer.supercoins = (customer.supercoins || 0) + coinsEarned;
          await customer.save();

          await Notification.create({
            user: customer._id,
            title: 'Supercoins Credited!',
            message: `You earned ${coinsEarned} Supercoins for order #${order._id}. Balance: ${customer.supercoins} coins.`,
          });
        }
      }

      await Notification.create({
        user: order.user,
        title: 'Order Delivered',
        message: `Order #${order._id} worth ₹${order.totalAmount} has been delivered successfully.`,
      });
    }

    if (status === 'Shipped' && prevStatus !== 'Shipped') {
      await Notification.create({
        user: order.user,
        title: 'Order Shipped',
        message: `Order #${order._id} has been shipped and is on the way!`,
      });
    }

    const updatedOrder = await order.save();
    
    return res.json({
      ...updatedOrder.toObject(),
      totalPrice: updatedOrder.totalAmount,
      status: updatedOrder.orderStatus
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/admin/products
// @access  Admin
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      discountPercentage,
      images,
      category,
      brand,
      stock,
      specifications,
      isFeatured,
      isTrending
    } = req.body;

    const imageFile = req.file;
    let finalImages = images || [];

    // Parse if it was sent as a comma-separated string or stringified array
    if (typeof finalImages === 'string') {
      finalImages = finalImages.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (imageFile) {
      const imageUpload = await uploadToCloudinary(imageFile.path);
      if (imageUpload && imageUpload.secure_url) {
        finalImages.push(imageUpload.secure_url);
      }
    }

    if (!finalImages.length) {
      finalImages = ['https://via.placeholder.com/400'];
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) return res.status(404).json({ message: 'Category not found' });

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      discountPercentage: Number(discountPercentage || 0),
      discountPrecentage: Number(discountPercentage || 0),
      image: finalImages[0],
      images: finalImages,
      category,
      brand,
      stock: Number(stock),
      specifications: specifications || [],
      isFeatured: isFeatured || false,
      isTrending: isTrending || false,
    });

    return res.status(201).json(product);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
// @access  Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) return res.status(404).json({ message: 'Category not found' });
    }

    const allowedFields = [
      'title',
      'description',
      'price',
      'discountPercentage',
      'images',
      'category',
      'brand',
      'stock',
      'specifications',
      'isFeatured',
      'isTrending'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'discountPercentage') {
          product.discountPercentage = Number(req.body.discountPercentage);
          product.discountPrecentage = Number(req.body.discountPercentage);
        } else if (field === 'images') {
          let finalImages = req.body.images;
          if (typeof finalImages === 'string') {
            finalImages = finalImages.split(',').map(s => s.trim()).filter(Boolean);
          }
          product.images = finalImages;
          if (finalImages.length > 0) {
            product.image = finalImages[0];
          }
        } else {
          product[field] = req.body[field];
        }
      }
    });

    const updatedProduct = await product.save();
    const populated = await Product.findById(updatedProduct._id).populate('category');
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
// @access  Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    return res.json({ message: 'Product removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};