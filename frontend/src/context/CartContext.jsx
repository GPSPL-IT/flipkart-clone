import React, { createContext, useState, useEffect, useContext, useRef, useMemo } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';
import { calculateMrp } from '../utils/price';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponError, setCouponError] = useState(null);
  
  // Track previous user state to detect logins/logouts
  const prevUserRef = useRef(user);

  // Load cart from DB if logged in, otherwise from localStorage
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        try {
          // If we had items in localstorage before login, sync them
          const guestCart = JSON.parse(localStorage.getItem('guest_cart')) || [];
          if (guestCart.length > 0 && !prevUserRef.current) {
            console.log('Syncing guest cart with DB...', guestCart);
            const { data } = await API.post('/cart', { items: guestCart });
            setCartItems(data.items || []);
            localStorage.removeItem('guest_cart');
          } else {
            const { data } = await API.get('/cart');
            setCartItems(data.items || []);
          }
        } catch (err) {
          console.error('Failed to load cart from server', err);
        }
      } else {
        const localItems = JSON.parse(localStorage.getItem('guest_cart')) || [];
        setCartItems(localItems);
      }
      setLoading(false);
      prevUserRef.current = user;
    };

    loadCart();
  }, [user]);

  // Sync to database if logged in, otherwise write to localStorage
  const syncCartState = async (updatedItems) => {
    setCartItems(updatedItems);
    if (user) {
      try {
        await API.post('/cart', { items: updatedItems });
      } catch (err) {
        console.error('Failed to sync cart to server', err);
      }
    } else {
      localStorage.setItem('guest_cart', JSON.stringify(updatedItems));
    }
  };

  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
  const existingIndex = cartItems.findIndex(
  item => item?.product && (item.product._id || item.product) === product._id
);

    let updatedItems = [...cartItems];

    if (existingIndex > -1) {
      // Increase quantity
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].savedForLater = false; // Move back to cart if it was saved
    } else {
      // Add new item
      updatedItems.push({
        product,
        quantity,
        savedForLater: false
      });
    }

    await syncCartState(updatedItems);
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    const updatedItems = cartItems.filter(
      item => (item.product._id || item.product) !== productId
    );
    await syncCartState(updatedItems);
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    const updatedItems = cartItems.map(item => {
      const id = item.product._id || item.product;
      if (id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    await syncCartState(updatedItems);
  };

  // Toggle Save for Later
  const toggleSaveForLater = async (productId, saveState) => {
    const updatedItems = cartItems.map(item => {
      const id = item.product._id || item.product;
      if (id === productId) {
        return { ...item, savedForLater: saveState };
      }
      return item;
    });
    await syncCartState(updatedItems);
  };

  // Clear cart
  const clearCart = async () => {
    setCartItems([]);
    setCoupon(null);
    if (user) {
      try {
        await API.delete('/cart');
      } catch (err) {
        console.error('Failed to clear cart on server', err);
      }
    } else {
      localStorage.removeItem('guest_cart');
    }
  };

  // Apply discount coupon
  const applyCoupon = async (code) => {
    setCouponError(null);
    try {
      const { data } = await API.post('/coupons/validate', {
        code,
        orderAmount: billingBreakdown.sellingPriceTotal
      });
      setCoupon(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      setCoupon(null);
      throw new Error(msg);
    }
  };

  // Remove applied coupon
  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  // Calculate detailed billing breakdowns — memoized via useMemo
  const billingBreakdown = useMemo(() => {
    const activeItems = cartItems.filter(item => !item.savedForLater);
    
    let mrpTotal = 0;
    let sellingPriceTotal = 0;
    let totalItemsCount = 0;

    activeItems.forEach(item => {
      const prod = item.product;
      if (prod) {
        const qty = item.quantity;
        totalItemsCount += qty;
        
        const sellingPrice = prod.price;
        const discount = prod.discountPercentage || 0;
        const mrp = calculateMrp(sellingPrice, discount);

        mrpTotal += mrp * qty;
        sellingPriceTotal += sellingPrice * qty;
      }
    });

    const itemDiscount = mrpTotal - sellingPriceTotal;
    const deliveryCharges = totalItemsCount === 0 ? 0 : (sellingPriceTotal > 500 ? 0 : 40);

    let couponDiscount = 0;
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        couponDiscount = (sellingPriceTotal * coupon.discountValue) / 100;
      } else {
        couponDiscount = coupon.discountValue;
      }
      couponDiscount = Math.min(couponDiscount, sellingPriceTotal);
    }

    const netPayable = Math.max(0, sellingPriceTotal - couponDiscount + deliveryCharges);

    return {
      mrpTotal: Math.round(mrpTotal),
      itemDiscount: Math.round(itemDiscount),
      sellingPriceTotal: Math.round(sellingPriceTotal),
      deliveryCharges,
      couponDiscount: Math.round(couponDiscount),
      netPayable: Math.round(netPayable),
      totalItemsCount,
      items: activeItems
    };
  }, [cartItems, coupon]);

  const contextValue = useMemo(() => ({
    cartItems,
    coupon,
    couponError,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSaveForLater,
    clearCart,
    applyCoupon,
    removeCoupon,
    billingBreakdown
  }), [cartItems, coupon, couponError, loading, billingBreakdown]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
