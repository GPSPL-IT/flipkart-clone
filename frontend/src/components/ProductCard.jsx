import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { calculateMrp, formatIndianCurrency } from '../utils/price';

const ProductCard = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isFavorite = isInWishlist(product._id);
  const sellingPrice = product.price;
  const discount = product.discountPercentage || 0;
  const mrp = calculateMrp(sellingPrice, discount);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-sm overflow-hidden relative shadow-sm hover:shadow-product hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-2.5 right-2.5 z-10 bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-800 p-1.5 rounded-full shadow-sm transition-colors border border-gray-100 dark:border-zinc-700"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-zinc-400 hover:text-red-500'
          }`}
        />
      </button>

      <Link to={`/product/${product._id}`} className="flex flex-col h-full">
        {/* Product Image Container */}
        <div className="w-full h-48 bg-white dark:bg-white flex items-center justify-center p-4 relative overflow-hidden">
          <img
            src={product.images?.[0] || product.image || 'https://via.placeholder.com/200'}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute bottom-2.5 left-2.5 bg-green-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm">
              {discount}% OFF
            </span>
          )}
        </div>

        {/* Content details */}
        <div className="p-3.5 flex flex-col flex-1 border-t border-gray-50 dark:border-zinc-800">
          <span className="text-xs text-gray-400 dark:text-zinc-500 font-semibold uppercase tracking-wider block mb-0.5">
            {product.brand}
          </span>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate mb-1.5" title={product.title}>
            {product.title}
          </h4>

          {/* Rating Badges */}
          <div className="flex items-center gap-2 mb-2">
            {product.ratings > 0 ? (
              <span className="bg-green-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                {product.ratings.toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
              </span>
            ) : (
              <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 font-bold text-[10px] px-1.5 py-0.5 rounded-sm">
                No ratings
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              ({product.numReviews || 0})
            </span>
          </div>

          {/* Price Layout */}
          <div className="flex items-baseline gap-2 mt-auto">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              ₹{formatIndianCurrency(sellingPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-xs text-gray-400 dark:text-zinc-500 line-through">
                  ₹{formatIndianCurrency(mrp)}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          
          <div className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
            Free delivery {sellingPrice > 500 ? '' : 'on orders over ₹500'}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
