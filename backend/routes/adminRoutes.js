const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dashboard metrics
router.get('/stats', protect, admin, getDashboardStats);

// Order management
router.get('/orders', protect, admin, getAllOrders);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

// User lists
router.get('/users', protect, admin, getAllUsers);

// Product CRUD (Admin-specific)
router.post('/products', protect, admin, createProduct);
router.route('/products/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
