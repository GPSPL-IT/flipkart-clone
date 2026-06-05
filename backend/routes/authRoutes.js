const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  getRecentlyViewed,
  addRecentlyViewed,
  addSavedCard,
  deleteSavedCard,
  addWalletFunds,
  redeemGiftCard,
  getNotifications,
  markNotificationRead,
  deleteNotification
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth endpoints
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// User profile endpoints
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Address endpoints
router.route('/addresses')
  .post(protect, addAddress);
router.route('/addresses/:addressId')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

// Wishlist endpoints
router.route('/wishlist')
  .get(protect, getWishlist);
router.route('/wishlist/toggle')
  .post(protect, toggleWishlist);

// Recently Viewed endpoints
router.route('/recently-viewed')
  .get(protect, getRecentlyViewed)
  .post(protect, addRecentlyViewed);

// Saved Cards endpoints
router.route('/cards')
  .post(protect, addSavedCard);
router.route('/cards/:cardId')
  .delete(protect, deleteSavedCard);

// Wallet & Gift Cards endpoints
router.post('/wallet/add', protect, addWalletFunds);
router.post('/giftcards/redeem', protect, redeemGiftCard);

// Notifications endpoints
router.route('/notifications')
  .get(protect, getNotifications);
router.route('/notifications/:id/read')
  .put(protect, markNotificationRead);
router.route('/notifications/:id')
  .delete(protect, deleteNotification);

module.exports = router;
