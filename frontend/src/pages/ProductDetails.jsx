import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Zap, Heart, Star, Sparkles, AlertCircle, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductDetailSkeleton } from '../components/Skeleton';
import ProductCard from '../components/ProductCard';
import API from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch product data on load or ID change
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/products/${id}`);
        // Backend returns { success, product, relatedProducts } at root level
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
        setActiveImage(data.product?.images?.[0] || '');

        // Fetch reviews — correct endpoint is /reviews/product/:productId
        const reviewsRes = await API.get(`/reviews/product/${id}`);
        setReviews(reviewsRes.data.reviews || []);

        // Add to user's recently viewed list in backend
        if (user) {
          await API.post('/auth/recently-viewed', { productId: id });
        }
      } catch (err) {
        console.error('Error fetching product details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id, user]);


  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for might have been removed.</p>
        <Link to="/" className="bg-flipkart-blue text-white font-bold text-sm px-6 py-2.5 rounded-sm">
          Go Home
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product._id);
  const sellingPrice = product.price;
  const discount = product.discountPercentage || 0;
  const mrp = discount > 0 ? sellingPrice / (1 - discount / 100) : sellingPrice;

  const handleAddToCart = () => {
    addToCart(product, 1);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!reviewTitle.trim() || !reviewComment.trim()) {
      return setReviewError('Please complete both review title and comment.');
    }

    try {
      await API.post(`/reviews`, {
        productId: product._id,
        rating,
        title: reviewTitle,
        comment: reviewComment
      });
      setReviewSuccess('Review submitted successfully!');
      
      // Clear fields
      setReviewTitle('');
      setReviewComment('');
      setRating(5);

      // Refresh reviews list
      const updatedReviews = await API.get(`/reviews/product/${product._id}`);
      setReviews(updatedReviews.data.reviews || []);
      
      // Update local product reviews counts
      setProduct(prev => ({
        ...prev,
        numReviews: prev.numReviews + 1,
        ratings: (prev.ratings * prev.numReviews + rating) / (prev.numReviews + 1)
      }));
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white dark:bg-zinc-900 p-4 md:p-6 border border-gray-200 dark:border-zinc-800 rounded-sm shadow-sm transition-colors">
        
        {/* Left Column: Image Galleries & CTAs */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex gap-4">
            
            {/* Thumbnails Sidebar */}
            <div className="flex flex-col gap-2.5">
              {product.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 border rounded cursor-pointer p-1 bg-white flex items-center justify-center overflow-hidden transition-all ${
                    activeImage === img ? 'border-flipkart-blue ring-1 ring-flipkart-blue' : 'border-gray-200 dark:border-zinc-700 hover:border-flipkart-blue'
                  }`}
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                </div>
              ))}
            </div>

            {/* Viewport Display Box */}
            <div className="flex-1 h-96 bg-white border border-gray-100 dark:border-zinc-800 rounded p-4 relative flex items-center justify-center overflow-hidden group/zoom">
              <img
                src={activeImage}
                alt={product.title}
                className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/zoom:scale-110"
              />
              
              {/* Wishlist Heart Overlay */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-4 right-4 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 p-2 rounded-full shadow-sm border border-gray-100 dark:border-zinc-700 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleAddToCart}
              className="bg-[#ff9f00] hover:bg-[#f39700] text-white font-bold py-3 md:py-4 px-4 rounded-sm flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-card transition-all"
            >
              <ShoppingCart className="w-5 h-5" /> ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-3 md:py-4 px-4 rounded-sm flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-card transition-all"
            >
              <Zap className="w-5 h-5 fill-white" /> BUY NOW
            </button>
          </div>
        </div>

        {/* Right Column: details Panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div>
            <span className="text-sm text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-widest">
              {product.brand}
            </span>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white mt-1 leading-snug">
              {product.title}
            </h1>
          </div>

          {/* Rating block */}
          <div className="flex items-center gap-3 text-sm">
            {product.ratings > 0 ? (
              <span className="bg-green-600 text-white font-bold text-xs px-2 py-0.5 rounded-sm flex items-center gap-0.5">
                {product.ratings.toFixed(1)} <Star className="w-3 h-3 fill-white" />
              </span>
            ) : (
              <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 font-bold text-xs px-2 py-0.5 rounded-sm">
                No Ratings
              </span>
            )}
            <span className="text-gray-400 font-semibold">
              {product.numReviews} Reviews & Ratings
            </span>
            {product.stock > 0 ? (
              <span className="text-green-600 dark:text-green-400 font-bold text-xs bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">
                In Stock ({product.stock} left)
              </span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-bold text-xs bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Pricing panel */}
          <div className="border-b border-gray-100 dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-gray-400 dark:text-zinc-500 line-through">
                    ₹{Math.round(mrp).toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-green-600 dark:text-green-400 font-bold">
                    {discount}% off
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">Inclusive of all taxes</p>
          </div>

          {/* Flipkart Bank Offers bullet points */}
          <div className="flex flex-col gap-2 bg-gray-50 dark:bg-zinc-800/40 p-3 rounded-sm">
            <h5 className="text-xs font-bold text-gray-500 dark:text-zinc-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-flipkart-yellow-dark" /> Available Offers
            </h5>
            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
              <li>
                <span className="font-bold text-green-600 dark:text-green-400">Bank Offer</span> 10% instant discount on HDFC Bank Credit Cards, up to ₹1,250. <a href="#" className="text-flipkart-blue font-bold">T&C</a>
              </li>
              <li>
                <span className="font-bold text-green-600 dark:text-green-400">Partner Offer</span> Sign up for Flipkart Pay Later and get a coupon worth ₹250. <a href="#" className="text-flipkart-blue font-bold">T&C</a>
              </li>
              <li>
                <span className="font-bold text-green-600 dark:text-green-400">Coupon Code</span> Apply <span className="font-mono bg-yellow-100 dark:bg-yellow-950/40 px-1 py-0.5 rounded font-bold text-yellow-800 dark:text-yellow-400">FLIPKART20</span> to save 20% on cart.
              </li>
            </ul>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Product Description</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-2">Specifications</h4>
              <div className="border border-gray-150 dark:border-zinc-800 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {product.specifications.map((spec, idx) => (
                      <tr
                        key={idx}
                        className={`${
                          idx % 2 === 0 ? 'bg-gray-50 dark:bg-zinc-800/20' : 'bg-white dark:bg-zinc-900'
                        } border-b border-gray-100 dark:border-zinc-800 last:border-b-0`}
                      >
                        <td className="w-1/3 py-2.5 px-4 font-semibold text-gray-400 dark:text-zinc-500">
                          {spec.name}
                        </td>
                        <td className="py-2.5 px-4 text-gray-700 dark:text-gray-300 font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Product Reviews Section */}
          <div className="border-t border-gray-100 dark:border-zinc-800 pt-6 mt-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4">
              Ratings & Reviews
            </h3>

            {/* Left/Right rating breakdown details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6 items-center">
              <div className="md:col-span-4 text-center bg-gray-50 dark:bg-zinc-800/20 p-4 rounded">
                <h4 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center justify-center gap-1">
                  {product.ratings.toFixed(1)} <Star className="w-6 h-6 fill-flipkart-yellow-dark text-flipkart-yellow-dark" />
                </h4>
                <p className="text-xs text-gray-400 dark:text-zinc-500 font-semibold mt-1">
                  Average Rating
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Based on {reviews.length} reviews</p>
              </div>

              {/* Progress visual representation placeholder for Flipkart look */}
              <div className="md:col-span-8 flex flex-col gap-1.5 text-xs text-gray-500">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviews.filter(r => r.rating === stars).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-3">{stars}★</span>
                      <div className="flex-1 bg-gray-150 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-green-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-5 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-4 mb-6">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-100 dark:border-zinc-800 pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="bg-green-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        {rev.rating} <Star className="w-2.5 h-2.5 fill-white" />
                      </span>
                      <span className="font-bold text-sm text-gray-800 dark:text-gray-100">
                        {rev.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {rev.comment}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500">
                      <span className="font-semibold text-gray-600 dark:text-zinc-400">{rev.name}</span>
                      <span>•</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic py-2">No reviews yet for this product. Be the first to review!</p>
              )}
            </div>

            {/* Add Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-gray-50 dark:bg-zinc-800/20 p-4 border border-gray-150 dark:border-zinc-800 rounded">
                <h4 className="text-sm font-bold text-gray-800 dark:text-white mb-3">Add Your Review</h4>
                
                {reviewError && <p className="text-xs text-red-600 font-bold mb-3">{reviewError}</p>}
                {reviewSuccess && <p className="text-xs text-green-600 font-bold mb-3">{reviewSuccess}</p>}

                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1">Rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(val)}
                        className="p-0.5 focus:outline-none"
                      >
                        <Star className={`w-5 h-5 ${val <= rating ? 'fill-flipkart-yellow-dark text-flipkart-yellow-dark' : 'text-gray-300 dark:text-zinc-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="Review Title (e.g. Excellent value for money)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-flipkart-blue"
                  />
                </div>

                <div className="mb-4">
                  <textarea
                    rows="3"
                    placeholder="Share details of your own experience with this product"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-flipkart-blue"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-5 py-2.5 rounded-sm shadow-sm"
                >
                  SUBMIT REVIEW
                </button>
              </form>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 text-xs font-semibold p-3.5 rounded flex items-center justify-between">
                <span>Please log in to submit a rating or review.</span>
                <Link to="/login" className="bg-flipkart-blue text-white font-bold px-3 py-1.5 rounded-sm">
                  Login
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Section: Related Products */}
      {relatedProducts.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-sm p-4 md:p-6 shadow-sm border border-gray-200 dark:border-zinc-800 transition-colors mt-8">
          <h3 className="text-base font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
            Related Products
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
