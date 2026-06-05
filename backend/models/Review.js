const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

// One review per user per product (enforced at DB level)
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Recalculates the product's average rating and review count after any change
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const [result] = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id:        '$product',
        numReviews: { $sum: 1 },
        ratings:    { $avg: '$rating' },
      },
    },
  ]);

  const update = result
    ? { numReviews: result.numReviews, ratings: Math.round(result.ratings * 10) / 10 }
    : { numReviews: 0, ratings: 0 };

  await mongoose.model('Product').findByIdAndUpdate(productId, update);
};

// Trigger recalculation after a review is saved
reviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.product);
});

// Trigger recalculation after a review is deleted
reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.calculateAverageRating(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
