const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon } = require('../controllers/couponController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate', protect, validateCoupon);
router.post('/', protect, admin, createCoupon);

module.exports = router;
