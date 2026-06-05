require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const connectDB = require('./config/db');

// ── Routes ───────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes= require('./routes/categoryRoutes');
const cartRoutes    = require('./routes/cartRoutes');
const couponRoutes  = require('./routes/couponRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes   = require('./routes/adminRoutes');

// ── Error middleware ─────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// ── Core middleware ──────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health check (used by Docker healthcheck + monitoring) ──
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth',       authRoutes);      // Auth + User Profile + Address + Wishlist
app.use('/api/products',   productRoutes);   // Product catalog + Reviews
app.use('/api/categories', categoryRoutes);  // Category listing
app.use('/api/cart',       cartRoutes);      // Persistent cart
app.use('/api/coupons',    couponRoutes);    // Coupon validation
app.use('/api/orders',     orderRoutes);     // Order checkout + history
app.use('/api/payment',    paymentRoutes);   // Stripe payment intents
app.use('/api/admin',      adminRoutes);     // Admin dashboard + CRUD

// ── Error handlers (must be last) ───────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
