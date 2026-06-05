const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pin: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  isRedeemed: {
    type: Boolean,
    required: true,
    default: false
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  redeemedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const GiftCard = mongoose.model('GiftCard', giftCardSchema);
module.exports = GiftCard;
