import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load wishlist when user state changes
  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      if (user) {
        try {
          const { data } = await API.get('/auth/wishlist');
          setWishlistItems(data || []);
        } catch (err) {
          console.error('Failed to load wishlist from server', err);
        }
      } else {
        const guestWish = JSON.parse(localStorage.getItem('guest_wishlist')) || [];
        setWishlistItems(guestWish);
      }
      setLoading(false);
    };

    loadWishlist();
  }, [user]);

  // Toggle wishlist item — optimized to update local state directly instead of refetching
  const toggleWishlist = async (product) => {
    const productId = product._id || product;
    
    if (user) {
      try {
        const { data } = await API.post('/auth/wishlist/toggle', { productId });
        
        // Direct local state update avoiding an extra network request
        if (data.isAdded) {
          setWishlistItems((prev) => [...prev, product]);
        } else {
          setWishlistItems((prev) => prev.filter((item) => (item._id || item) !== productId));
        }
        return data.isAdded;
      } catch (err) {
        console.error('Failed to toggle wishlist item on server', err);
        throw err;
      }
    } else {
      // Guest local storage wishlist
      const guestWish = JSON.parse(localStorage.getItem('guest_wishlist')) || [];
      const existingIndex = guestWish.findIndex((item) => (item._id || item) === productId);
      let isAdded = false;

      if (existingIndex > -1) {
        guestWish.splice(existingIndex, 1);
      } else {
        guestWish.push(product);
        isAdded = true;
      }

      localStorage.setItem('guest_wishlist', JSON.stringify(guestWish));
      setWishlistItems([...guestWish]);
      return isAdded;
    }
  };

  // Check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        loading,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
export default WishlistContext;
