import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleRemove = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(prod);
  };

  const handleAddToCart = (e, prod) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(prod, 1);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse flex flex-col gap-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-500 fill-red-500" /> My Wishlist ({wishlistItems.length})
      </h2>

      {wishlistItems.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
          <p className="text-gray-500 font-medium">Your wishlist is currently empty.</p>
          <Link to="/" className="bg-flipkart-blue text-white font-bold text-xs px-5 py-2.5 rounded-sm hover:bg-flipkart-blue-dark">
            BROWSE PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm shadow-sm overflow-hidden divide-y divide-gray-150 dark:divide-zinc-800 transition-colors">
          {wishlistItems.map((prod) => {
            const sellingPrice = prod.price;
            const discount = prod.discountPercentage || 0;
            const mrp = discount > 0 ? sellingPrice / (1 - discount / 100) : sellingPrice;

            return (
              <div key={prod._id} className="p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start group hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                
                {/* Product Thumbnail */}
                <Link to={`/product/${prod._id}`} className="w-20 h-20 bg-white flex items-center justify-center p-1.5 rounded border border-gray-150 relative">
                  <img src={prod.images?.[0] || prod.image || ''} alt={prod.title} className="max-h-full max-w-full object-contain" />
                </Link>

                {/* Details info */}
                <div className="flex-1 flex flex-col gap-1 w-full text-center sm:text-left">
                  <Link to={`/product/${prod._id}`} className="text-sm font-semibold text-gray-800 dark:text-white hover:text-flipkart-blue transition-colors line-clamp-1">
                    {prod.title}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{prod.brand}</span>
                  
                  {/* Rating Badge */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
                    {prod.ratings > 0 ? (
                      <span className="bg-green-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                        {prod.ratings.toFixed(1)} <Star className="w-2.5 h-2.5 fill-white" />
                      </span>
                    ) : (
                      <span className="bg-gray-100 dark:bg-zinc-800 text-gray-400 font-bold text-[10px] px-1.5 py-0.5 rounded-sm">
                        No ratings
                      </span>
                    )}
                    <span className="text-gray-400">({prod.numReviews || 0})</span>
                  </div>

                  {/* Prices */}
                  <div className="flex items-baseline justify-center sm:justify-start gap-2.5 mt-1">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      ₹{sellingPrice.toLocaleString('en-IN')}
                    </span>
                    {discount > 0 && (
                      <>
                        <span className="text-xs text-gray-400 line-through">
                          ₹{Math.round(mrp).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-green-600 font-bold">{discount}% off</span>
                      </>
                    )}
                  </div>
                </div>

                {/* CTA actions */}
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto items-center mt-3 sm:mt-0">
                  <button
                    onClick={(e) => handleAddToCart(e, prod)}
                    className="flex-1 sm:w-36 bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold text-xs py-2 px-3 rounded-sm flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> ADD TO CART
                  </button>
                  <button
                    onClick={(e) => handleRemove(e, prod)}
                    className="flex-1 sm:w-36 bg-gray-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-600 dark:text-zinc-400 hover:text-red-650 font-bold text-xs py-2 px-3 rounded-sm border border-gray-200 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> REMOVE
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
