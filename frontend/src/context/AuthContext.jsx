import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Check if token exists on mount and fetch user profile
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await API.get('/auth/profile');
          setUser(data);
          // Load notifications for logged-in user
          fetchUserNotifications();
        } catch (err) {
          console.error('Session expired or token invalid', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  // Login action
  const login = async (email, password) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      // Fetch full profile to get addresses, cards, wallet, etc.
      const profileRes = await API.get('/auth/profile');
      setUser(profileRes.data);
      fetchUserNotifications();
      return profileRes.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Register action
  const register = async (name, email, password) => {
    setError(null);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
        addresses: [],
        savedCards: [],
        supercoins: 0,
        walletBalance: 0
      });
      setNotifications([]);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      throw new Error(msg);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotifications([]);
  };

  // Forgot password simulator
  const forgotPassword = async (email) => {
    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to request password reset.';
      throw new Error(msg);
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, { password });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password.';
      throw new Error(msg);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/profile', profileData);
      // Backend returns { message, user: userObj } — read from data.user
      const updated = data.user || data;
      setUser(prev => ({
        ...prev,
        name: updated.name ?? prev.name,
        email: updated.email ?? prev.email,
        role: updated.role ?? prev.role
      }));
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      throw new Error(msg);
    }
  };


  // Address: Add
  const addAddress = async (addressData) => {
    try {
      const { data } = await API.post('/auth/addresses', addressData);
      setUser(prev => ({ ...prev, addresses: data }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add address.';
      throw new Error(msg);
    }
  };

  // Address: Update
  const updateAddress = async (addressId, addressData) => {
    try {
      const { data } = await API.put(`/auth/addresses/${addressId}`, addressData);
      setUser(prev => ({ ...prev, addresses: data }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update address.';
      throw new Error(msg);
    }
  };

  // Address: Delete
  const deleteAddress = async (addressId) => {
    try {
      const { data } = await API.delete(`/auth/addresses/${addressId}`);
      setUser(prev => ({ ...prev, addresses: data }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete address.';
      throw new Error(msg);
    }
  };

  // ==========================================
  // EXTENDED PROFILE BINDING APIs
  // ==========================================

  // Saved Cards: Add
  const addSavedCard = async (cardData) => {
    try {
      const { data } = await API.post('/auth/cards', cardData);
      setUser(prev => ({ ...prev, savedCards: data }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save card.';
      throw new Error(msg);
    }
  };

  // Saved Cards: Delete
  const deleteSavedCard = async (cardId) => {
    try {
      const { data } = await API.delete(`/auth/cards/${cardId}`);
      setUser(prev => ({ ...prev, savedCards: data }));
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete card.';
      throw new Error(msg);
    }
  };

  // Wallet: Add Funds
  const addWalletFunds = async (amount) => {
    try {
      const { data } = await API.post('/auth/wallet/add', { amount });
      setUser(prev => ({ ...prev, walletBalance: data.walletBalance }));
      fetchUserNotifications(); // reload notifications since a log is added
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add wallet funds.';
      throw new Error(msg);
    }
  };

  // Wallet: Redeem Gift Card
  const redeemGiftCard = async (code, pin) => {
    try {
      const { data } = await API.post('/auth/giftcards/redeem', { code, pin });
      setUser(prev => ({ ...prev, walletBalance: data.walletBalance }));
      fetchUserNotifications(); // reload notifications
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Gift card validation error.';
      throw new Error(msg);
    }
  };

  // Notifications: Get list
  const fetchUserNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const { data } = await API.get('/auth/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications list', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Notifications: Mark as read
  const markNotificationAsRead = async (id) => {
    try {
      await API.put(`/auth/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  // Notifications: Delete
  const deleteNotification = async (id) => {
    try {
      await API.delete(`/auth/notifications/${id}`);
      setNotifications(prev => prev.filter(notif => notif._id !== id));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        notifications,
        notificationsLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        addSavedCard,
        deleteSavedCard,
        addWalletFunds,
        redeemGiftCard,
        fetchUserNotifications,
        markNotificationAsRead,
        deleteNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
