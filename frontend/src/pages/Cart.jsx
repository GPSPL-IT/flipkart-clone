import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ShieldCheck, Tag, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const {
    cartItems,
    coupon,
    couponError,
    removeFromCart,
    updateQuantity,
    toggleSaveForLater,
    applyCoupon,
    removeCoupon,
    billingBreakdown
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const activeItems = cartItems.filter(item => !item.savedForLater);
  const savedItems = cartItems.filter(item => item.savedForLater);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const handleCheckoutRedirect = () => {
    if (!user) {
      // If not logged in, redirect to login page with callback URL to cart page
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm mt-6 shadow-sm">
        <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-zinc-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Your Cart is Empty!</h2>
        <p className="text-gray-500 mb-6">Explore our top categories and find best deals today.</p>
        <Link to="/" className="bg-flipkart-blue text-white font-bold text-sm px-8 py-2.5 rounded-sm hover:bg-flipkart-blue-dark">
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column: Cart listing */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Active Items Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-sm border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
            <div className="border-b border-gray-100 dark:border-zinc-800 px-4 py-3 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-800 dark:text-white">
                Flipkart Cart ({activeItems.length})
              </h3>
              {user && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  Deliver to: <span className="font-bold text-gray-800 dark:text-gray-200">{user.name}</span>
                </span>
              )}
            </div>

            {activeItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No active items in cart. Go to <span className="font-bold text-flipkart-blue cursor-pointer" onClick={() => navigate('/')}>Home</span> to add products.
              </div>
            ) : (
              <div className="divide-y divide-gray-150 dark:divide-zinc-800">
                {activeItems.map((item) => {
                  const prod = item.product;
                  const sellingPrice = prod.price;
                  const discount = prod.discountPercentage || 0;
                  const mrp = discount > 0 ? sellingPrice / (1 - discount / 100) : sellingPrice;

                  return (
                    <div key={prod._id} className="p-4 flex flex-col sm:flex-row gap-4 items-start">
                      
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-white flex items-center justify-center p-2 rounded border border-gray-150 relative self-center sm:self-start">
                        <img src={prod.images[0]} alt={prod.title} className="max-h-full max-w-full object-contain" />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col gap-1.5 w-full">
                        <Link to={`/product/${prod._id}`} className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-flipkart-blue transition-colors line-clamp-2">
                          {prod.title}
                        </Link>
                        <span className="text-xs text-gray-400 font-semibold uppercase">{prod.brand}</span>
                        
                        {/* Prices */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-base font-bold text-gray-900 dark:text-white">
                            ₹{sellingPrice.toLocaleString('en-IN')}
                          </span>
                          {discount > 0 && (
                            <>
                              <span className="text-xs text-gray-400 line-through">
                                ₹{Math.round(mrp).toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-green-600 font-semibold">{discount}% Off</span>
                            </>
                          )}
                        </div>

                        {/* Adjust Amount Buttons and Save controls */}
                        <div className="flex items-center gap-4 mt-2 border-t border-gray-50 dark:border-zinc-800/40 pt-2.5">
                          <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded overflow-hidden">
                            <button
                              onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                              className="px-2 py-1 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3.5 py-1 text-sm font-bold text-gray-800 dark:text-white bg-white dark:bg-zinc-900 select-none">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                              className="px-2 py-1 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => toggleSaveForLater(prod._id, true)}
                            className="text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-flipkart-blue transition-colors flex items-center gap-1"
                          >
                            <Heart className="w-3.5 h-3.5 text-gray-400" /> SAVE FOR LATER
                          </button>

                          <button
                            onClick={() => removeFromCart(prod._id)}
                            className="text-xs font-bold text-red-600 hover:text-red-500 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> REMOVE
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Saved for Later Section */}
          {savedItems.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-sm border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-colors">
              <div className="border-b border-gray-100 dark:border-zinc-800 px-4 py-3">
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                  Saved for Later ({savedItems.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-150 dark:divide-zinc-800">
                {savedItems.map((item) => {
                  const prod = item.product;
                  return (
                    <div key={prod._id} className="p-4 flex gap-4 items-start bg-gray-50/50 dark:bg-zinc-900/30">
                      
                      <div className="w-20 h-20 bg-white flex items-center justify-center p-1.5 rounded border border-gray-150">
                        <img src={prod.images[0]} alt={prod.title} className="max-h-full max-w-full object-contain" />
                      </div>

                      <div className="flex-1 flex flex-col gap-1 w-full">
                        <Link to={`/product/${prod._id}`} className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-flipkart-blue line-clamp-1">
                          {prod.title}
                        </Link>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{prod.brand}</span>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </div>

                        <div className="flex items-center gap-4 mt-2">
                          <button
                            onClick={() => toggleSaveForLater(prod._id, false)}
                            className="text-xs font-bold text-flipkart-blue dark:text-blue-400 hover:underline"
                          >
                            MOVE TO CART
                          </button>
                          <button
                            onClick={() => removeFromCart(prod._id)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Right column: Invoice price panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Coupon discount panel */}
          <div className="bg-white dark:bg-zinc-900 rounded-sm border border-gray-200 dark:border-zinc-800 shadow-sm p-4 transition-colors">
            <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-flipkart-orange" /> Have a Coupon?
            </h4>
            
            {coupon ? (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-sm flex justify-between items-center text-xs text-green-800 dark:text-green-400">
                <div>
                  <span className="font-mono font-bold">{coupon.code}</span> applied!
                  <span className="block text-[10px] text-green-600 font-semibold mt-0.5">
                    Saved ₹{coupon.discountAmount} extra.
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="font-bold text-red-600 dark:text-red-400 hover:underline ml-2"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FLIPKART20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-gray-50 dark:bg-zinc-800 text-xs px-3 py-2 border border-gray-200 dark:border-zinc-700 rounded-sm uppercase font-mono font-bold tracking-wider outline-none focus:ring-1 focus:ring-flipkart-blue"
                />
                <button
                  type="submit"
                  disabled={applying || activeItems.length === 0}
                  className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-4 py-2 rounded-sm disabled:opacity-50 transition-colors"
                >
                  {applying ? 'APPLYING...' : 'APPLY'}
                </button>
              </form>
            )}
            {couponError && <p className="text-[10px] text-red-600 font-bold mt-2">{couponError}</p>}
          </div>

          {/* Pricing breakdown details invoice */}
          <div className="bg-white dark:bg-zinc-900 rounded-sm border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors">
            <div className="border-b border-gray-100 dark:border-zinc-800 px-4 py-3">
              <h4 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Price Details
              </h4>
            </div>

            <div className="p-4 flex flex-col gap-3.5 text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Price ({billingBreakdown.totalItemsCount} items)</span>
                <span>₹{billingBreakdown.mrpTotal.toLocaleString('en-IN')}</span>
              </div>
              {billingBreakdown.itemDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{billingBreakdown.itemDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Delivery Charges</span>
                <span className={billingBreakdown.deliveryCharges === 0 ? 'text-green-600 font-bold' : ''}>
                  {billingBreakdown.deliveryCharges === 0 ? 'FREE' : `₹${billingBreakdown.deliveryCharges}`}
                </span>
              </div>
              {coupon && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount ({coupon.code})</span>
                  <span>- ₹{billingBreakdown.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-dashed border-gray-200 dark:border-zinc-800 pt-3.5 flex justify-between font-extrabold text-base text-gray-900 dark:text-white">
                <span>Total Amount</span>
                <span>₹{billingBreakdown.netPayable.toLocaleString('en-IN')}</span>
              </div>

              {billingBreakdown.itemDiscount + billingBreakdown.couponDiscount > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/20 p-2.5 rounded text-center">
                  You will save ₹{(billingBreakdown.itemDiscount + billingBreakdown.couponDiscount).toLocaleString('en-IN')} on this order
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 dark:border-zinc-800 p-4">
              <button
                onClick={handleCheckoutRedirect}
                disabled={activeItems.length === 0}
                className="w-full bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-3 rounded-sm text-sm shadow-sm hover:shadow-card disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
              >
                PLACE ORDER
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-gray-400 font-semibold px-2">
            <ShieldCheck className="w-8 h-8 text-gray-400" />
            <span>Safe and Secure Payments. Easy returns. 100% Authentic products.</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
