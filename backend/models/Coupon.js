const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true
  },
  expireDate: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  minOrderAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Check if coupon is expired
couponSchema.methods.isExpired = function () {
  return Date.now() > this.expireDate;
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
