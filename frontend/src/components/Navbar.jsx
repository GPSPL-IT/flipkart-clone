import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, LogOut, LayoutDashboard, Sun, Moon, MapPin, ChevronDown, Gift, Bell, CreditCard, Navigation, ShoppingBag, Sparkles, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import API from '../services/api';

const Navbar = () => {
  const { user, logout, notifications } = useAuth();
  const { billingBreakdown } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply/remove 'dark' class on <html> whenever darkMode changes.
  // Without this, Tailwind's dark: variants would never activate!
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);
  
  const suggestionsRef = useRef(null);

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Get active user address for display
  const userAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];
  const locationText = userAddress 
    ? `${userAddress.street}, ${userAddress.city}` 
    : 'Select Delivery Location';

  // Sync search keyword with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) setKeyword(q);
    else setKeyword('');
  }, [location.search]);

  // Fetch search suggestions — debounced 300ms to avoid spamming the API
  useEffect(() => {
    if (keyword.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await API.get('/products', { params: { keyword, limit: 5 } });
        setSuggestions(data.products || []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Close suggestions dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleSuggestionClick = (prodId) => {
    setShowSuggestions(false);
    setKeyword('');
    navigate(`/product/${prodId}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-white transition-colors duration-200 shadow-sm">
      
      {/* ROW 1: BRAND TABS & LOCATION STATS */}
      <div className="bg-gray-50 dark:bg-zinc-950 py-2 border-b border-gray-150 dark:border-zinc-850 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
                   {/* Brand Tabs */}
          <div className="flex items-center gap-2">
            <Link to="/" className="bg-[#ffe500] hover:bg-yellow-400 text-gray-950 font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-xs transition-colors">
              <span className="text-blue-700 italic font-black text-sm">f</span>
              <span className="font-extrabold tracking-tight">Flipkart</span>
            </Link>
          </div>

          {/* Location details & Theme Toggle */}
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 dark:text-zinc-400">
            <button onClick={() => navigate('/profile?tab=addresses')} className="flex items-center gap-1 hover:text-flipkart-blue truncate max-w-[200px] md:max-w-sm">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{locationText}</span>
              <span className="text-[10px] text-gray-400 font-bold ml-0.5">&gt;</span>
            </button>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 rounded-full bg-gray-200/60 dark:bg-zinc-800 text-gray-550 dark:text-zinc-300 hover:scale-105 transition-transform"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-flipkart-yellow" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* ROW 2: SEARCH BOX, AUTHS & CART */}
      <div className="py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          
          {/* Brand/Back Link on Mobile */}
          <Link to="/" className="text-lg font-black italic tracking-wide text-flipkart-blue dark:text-white sm:hidden leading-none">
            Flipkart
          </Link>

          {/* Search Inputs */}
          <div className="flex-1 relative" ref={suggestionsRef}>
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-gray-100 dark:bg-zinc-800/60 hover:bg-gray-100/80 border border-gray-200 dark:border-zinc-750 focus-within:border-flipkart-blue rounded-md overflow-hidden text-gray-800 dark:text-gray-150 transition-colors shadow-inner">
              <button type="submit" className="p-2 text-gray-400 dark:text-zinc-300 hover:text-flipkart-blue">
                <Search className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Search for Products, Brands and More"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-transparent py-1.5 md:py-2 text-sm outline-none border-none focus:ring-0 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </form>

            {/* suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-sm shadow-product text-gray-800 dark:text-gray-150 overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800 z-50">
                {suggestions.map((prod) => (
                  <div
                    key={prod._id}
                    onClick={() => handleSuggestionClick(prod._id)}
                    className="px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-zinc-855 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.images?.[0] || prod.image || ''} alt="" className="w-8 h-8 object-contain bg-white rounded border border-gray-100 p-0.5" />
                      <div>
                        <span className="font-semibold block truncate max-w-[200px] md:max-w-[400px]">{prod.title}</span>
                        <span className="text-[10px] text-gray-400">{prod.brand}</span>
                      </div>
                    </div>
                    <span className="text-flipkart-blue dark:text-blue-400 font-bold">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-4 md:gap-7">
            
            {/* Login Menu */}
            {user ? (
              <div className="relative group/user py-2 cursor-pointer">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700 dark:text-zinc-200 hover:text-flipkart-blue transition-colors">
                  <User className="w-4.5 h-4.5 text-gray-400" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover/user:rotate-180 transition-transform" />
                  {unreadNotificationsCount > 0 && (
                    <span className="w-2 h-2 bg-flipkart-orange rounded-full animate-ping"></span>
                  )}
                </div>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-sm shadow-product text-gray-800 dark:text-gray-100 hidden group-hover/user:block overflow-hidden py-1 divide-y divide-gray-100 dark:divide-zinc-800 z-50">
                  <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Your Account
                  </div>
                  <Link to="/profile?tab=personal" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <User className="w-4.5 h-4.5 text-gray-405" /> My Profile
                  </Link>
                  <Link to="/orders" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <ShoppingBag className="w-4.5 h-4.5 text-gray-405" /> Orders
                  </Link>
                  <Link to="/profile?tab=wallet" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <CreditCard className="w-4.5 h-4.5 text-gray-405" /> Saved Cards & Wallet
                  </Link>
                  <Link to="/profile?tab=addresses" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <MapPin className="w-4.5 h-4.5 text-gray-405" /> Saved Addresses
                  </Link>
                  <Link to="/wishlist" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <Heart className="w-4.5 h-4.5 text-gray-405" /> Wishlist
                  </Link>
                  <Link to="/profile?tab=giftcards" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <Gift className="w-4.5 h-4.5 text-gray-405" /> Gift Cards
                  </Link>
                  <Link to="/profile?tab=notifications" className="px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-4.5 h-4.5 text-gray-455" /> Notifications
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <span className="bg-flipkart-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadNotificationsCount}
                      </span>
                    )}
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="px-4 py-2.5 text-xs text-flipkart-blue dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center gap-3 font-bold border-t">
                      <LayoutDashboard className="w-4.5 h-4.5" /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-955/20 text-red-650 dark:text-red-400 flex items-center gap-3"
                  >
                    <LogOut className="w-4.5 h-4.5" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold text-gray-750 dark:text-zinc-250 hover:text-flipkart-blue flex items-center gap-1"
              >
                <User className="w-4.5 h-4.5 text-gray-400" />
                <span>Login</span>
              </Link>
            )}

            {/* More dropdown */}
            <div className="relative group/more py-2 cursor-pointer hidden sm:block">
              <span className="text-sm font-bold text-gray-755 dark:text-zinc-250 hover:text-flipkart-blue flex items-center gap-0.5">
                More <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </span>
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-sm shadow-product text-gray-800 dark:text-gray-100 hidden group-hover/more:block overflow-hidden py-1">
                <Link to="/profile?tab=notifications" className="px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 font-semibold">
                  <Bell className="w-4 h-4 text-gray-450" /> Notification Preferences
                </Link>
                <a href="#" className="px-4 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4 text-gray-450" /> Customer Care Support
                </a>
              </div>
            </div>

            {/* Cart Link */}
            <Link
              to="/cart"
              className="flex items-center gap-1.5 font-bold text-sm text-gray-750 dark:text-zinc-200 hover:text-flipkart-blue"
            >
              <div className="relative p-1.5">
                <ShoppingCart className="w-5 h-5 text-gray-650 dark:text-zinc-350" />
                {billingBreakdown.totalItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-flipkart-orange text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow">
                    {billingBreakdown.totalItemsCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </Link>

          </div>

        </div>
      </div>

    </nav>
  );
};

export default Navbar;
