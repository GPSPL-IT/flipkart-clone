const Order   = require('../models/Order');
const Product = require('../models/Product');
const Cart    = require('../models/Cart');

// ── Stripe setup — gracefully mocked if key is missing ──
const isStripeConfigured =
  process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_placeholder');

const stripe = isStripeConfigured
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// ────────────────────────────────────────────────────────
// @desc    Create Stripe Payment Intent
// @route   POST /api/payment/create-payment-intent
// @access  Private
// ────────────────────────────────────────────────────────
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body; // Amount in Paise (₹100 = 10000 paise)

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    if (stripe) {
      // Real Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount:   Math.round(amount),
        currency: 'inr',
        metadata: { integration_check: 'accept_a_payment' },
      });

      return res.json({ clientSecret: paymentIntent.client_secret, simulated: false });
    }

    // Simulated intent for development (no real Stripe key)
    console.log(`[Stripe Mock] Simulating payment intent for ₹${(amount / 100).toFixed(2)}`);
    return res.json({
      clientSecret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`,
      simulated: true,
    });
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// ────────────────────────────────────────────────────────
const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // Determine payment status — COD starts unpaid; card payments are paid immediately
    const isCOD = paymentMethod === 'COD';

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountAmount,
      totalPrice,
      isPaid:  !isCOD,
      paidAt:  !isCOD ? Date.now() : undefined,
    });

    // Decrement stock for all ordered items in parallel (faster than serial loop)
    await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.qty);
          await product.save();
        }
      })
    );

    const createdOrder = await order.save();

    // Clear the user's cart after successful order creation
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    return res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private (owner or admin)
// ────────────────────────────────────────────────────────
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order owner or an admin can view it
    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    return res.json(order);
  } catch (error) {
    next(error);
  }
};

// ────────────────────────────────────────────────────────
// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
// ────────────────────────────────────────────────────────
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  addOrderItems,
  getOrderById,
  getMyOrders,
};
