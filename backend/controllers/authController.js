const User         = require('../models/User');
const Product      = require('../models/Product');
const GiftCard     = require('../models/GiftCard');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');
const crypto       = require('crypto');

// In-memory password reset token store (cleared on restart — use Redis in production)
const resetTokens = new Map();

// @desc    Register a new user
// @route   POST /api/auth/register  @access Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    return res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (error) { next(error); }
};

// @desc    Login and return JWT
// @route   POST /api/auth/login  @access Public
const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    return res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id),
    });
  } catch (error) { next(error); }
};

// @desc    Request password reset link (logged to console)
// @route   POST /api/auth/forgot-password  @access Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    resetTokens.set(resetToken, { userId: user._id, expires: Date.now() + 60 * 60 * 1000 });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log(`\n=== PASSWORD RESET ===\nEmail: ${email}\nURL: ${resetUrl}\n=====================\n`);

    return res.json({
      message: 'Reset link logged to server console.',
      resetUrl: process.env.NODE_ENV === 'development' ? resetUrl : undefined,
    });
  } catch (error) { next(error); }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token  @access Public
const resetPassword = async (req, res, next) => {
  try {
    const tokenData = resetTokens.get(req.params.token);
    if (!tokenData || tokenData.expires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const user = await User.findById(tokenData.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = req.body.password; // pre-save hook hashes it
    await user.save();
    resetTokens.delete(req.params.token);
    return res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) { next(error); }
};

// @desc    Get user profile
// @route   GET /api/auth/profile  @access Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({
      _id: user._id, name: user.name, email: user.email, role: user.role,
      addresses: user.addresses, savedCards: user.savedCards,
      supercoins: user.supercoins, walletBalance: user.walletBalance,
    });
  } catch (error) { next(error); }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile  @access Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name  = req.body.name  || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    return res.json({
      _id: updated._id, name: updated.name, email: updated.email,
      role: updated.role, token: generateToken(updated._id),
    });
  } catch (error) { next(error); }
};

// @desc    Add address  @route POST /api/auth/addresses  @access Private
const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;
    if (isDefault) user.addresses.forEach((a) => { a.isDefault = false; });

    user.addresses.push({
      name, street, city, state, zipCode, country, phone,
      isDefault: isDefault || user.addresses.length === 0,
    });
    await user.save();
    return res.status(201).json(user.addresses);
  } catch (error) { next(error); }
};

// @desc    Update address  @route PUT /api/auth/addresses/:addressId  @access Private
const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;
    if (isDefault) {
      user.addresses.forEach((a) => {
        if (a._id.toString() !== req.params.addressId) a.isDefault = false;
      });
    }

    // Only update provided fields
    if (name      != null) address.name      = name;
    if (street    != null) address.street    = street;
    if (city      != null) address.city      = city;
    if (state     != null) address.state     = state;
    if (zipCode   != null) address.zipCode   = zipCode;
    if (country   != null) address.country   = country;
    if (phone     != null) address.phone     = phone;
    if (isDefault != null) address.isDefault = isDefault;

    await user.save();
    return res.json(user.addresses);
  } catch (error) { next(error); }
};

// @desc    Delete address  @route DELETE /api/auth/addresses/:addressId  @access Private
const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: 'Address not found' });

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);
    if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;

    await user.save();
    return res.json(user.addresses);
  } catch (error) { next(error); }
};

// @desc    Get wishlist  @route GET /api/auth/wishlist  @access Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist', populate: { path: 'category', select: 'name slug' },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.wishlist);
  } catch (error) { next(error); }
};

// @desc    Toggle wishlist  @route POST /api/auth/wishlist/toggle  @access Private
const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const [user, product] = await Promise.all([
      User.findById(req.user._id),
      Product.findById(productId),
    ]);
    if (!user)    return res.status(404).json({ message: 'User not found' });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const index   = user.wishlist.indexOf(productId);
    const isAdded = index === -1;
    if (isAdded) { user.wishlist.push(productId); } else { user.wishlist.splice(index, 1); }

    await user.save();
    return res.json({ message: isAdded ? 'Added to wishlist' : 'Removed from wishlist', wishlist: user.wishlist, isAdded });
  } catch (error) { next(error); }
};

// @desc    Get recently viewed  @route GET /api/auth/recently-viewed  @access Private
const getRecentlyViewed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('recentlyViewed');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.recentlyViewed);
  } catch (error) { next(error); }
};

// @desc    Add to recently viewed (max 8, no duplicates)
// @route   POST /api/auth/recently-viewed  @access Private
const addRecentlyViewed = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.recentlyViewed = user.recentlyViewed.filter((id) => id.toString() !== productId);
    user.recentlyViewed.unshift(productId);
    if (user.recentlyViewed.length > 8) user.recentlyViewed.pop();

    await user.save();
    return res.json(user.recentlyViewed);
  } catch (error) { next(error); }
};

// @desc    Add saved card (masked)  @route POST /api/auth/cards  @access Private
const addSavedCard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { cardHolder, cardNumber, expiryDate, cardType } = req.body;
    if (!cardHolder || !cardNumber || !expiryDate) {
      return res.status(400).json({ message: 'Please provide all card details' });
    }

    const lastFour = cardNumber.replace(/\s+/g, '').slice(-4);
    user.savedCards.push({
      cardHolder,
      cardNumber: `**** **** **** ${lastFour}`, // never store full card number
      expiryDate,
      cardType: cardType || 'Visa',
    });
    await user.save();
    return res.status(201).json(user.savedCards);
  } catch (error) { next(error); }
};

// @desc    Delete saved card  @route DELETE /api/auth/cards/:cardId  @access Private
const deleteSavedCard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.savedCards.pull(req.params.cardId);
    await user.save();
    return res.json(user.savedCards);
  } catch (error) { next(error); }
};

// @desc    Add money to wallet  @route POST /api/auth/wallet/add  @access Private
const addWalletFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += Number(amount);
    await user.save();
    await Notification.create({
      user: user._id, title: 'Wallet Credited',
      message: `₹${amount} added to your wallet. Balance: ₹${user.walletBalance}.`,
    });
    return res.json({ walletBalance: user.walletBalance });
  } catch (error) { next(error); }
};

// @desc    Redeem gift card  @route POST /api/auth/giftcards/redeem  @access Private
const redeemGiftCard = async (req, res, next) => {
  try {
    const { code, pin } = req.body;
    if (!code || !pin) return res.status(400).json({ message: 'Code and PIN required' });

    const giftCard = await GiftCard.findOne({ code, pin, isRedeemed: false });
    if (!giftCard) return res.status(400).json({ message: 'Invalid or already redeemed gift card' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    giftCard.isRedeemed = true;
    giftCard.redeemedBy = user._id;
    giftCard.redeemedAt = new Date();
    user.walletBalance  += giftCard.amount;

    await Promise.all([giftCard.save(), user.save()]);
    await Notification.create({
      user: user._id, title: 'Gift Card Redeemed',
      message: `₹${giftCard.amount} gift card redeemed and added to your wallet.`,
    });
    return res.json({ walletBalance: user.walletBalance, amountRedeemed: giftCard.amount });
  } catch (error) { next(error); }
};

// @desc    Get notifications  @route GET /api/auth/notifications  @access Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(notifications);
  } catch (error) { next(error); }
};

// @desc    Mark notification read  @route PUT /api/auth/notifications/:id/read  @access Private
const markNotificationRead = async (req, res, next) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    if (n.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    n.isRead = true;
    await n.save();
    return res.json(n);
  } catch (error) { next(error); }
};

// @desc    Delete notification  @route DELETE /api/auth/notifications/:id  @access Private
const deleteNotification = async (req, res, next) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    if (n.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await n.deleteOne();
    return res.json({ message: 'Notification deleted' });
  } catch (error) { next(error); }
};

module.exports = {
  registerUser, authUser, forgotPassword, resetPassword,
  getUserProfile, updateUserProfile,
  addAddress, updateAddress, deleteAddress,
  getWishlist, toggleWishlist,
  getRecentlyViewed, addRecentlyViewed,
  addSavedCard, deleteSavedCard,
  addWalletFunds, redeemGiftCard,
  getNotifications, markNotificationRead, deleteNotification,
};
