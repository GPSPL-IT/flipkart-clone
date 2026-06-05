import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Key, Plus, Edit, Trash2, ShieldCheck, Ticket, Award, Sparkles, CreditCard, Gift, Bell, Check, Copy } from 'lucide-react';
import API from '../services/api';

const Profile = () => {
  const {
    user,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    addSavedCard,
    deleteSavedCard,
    addWalletFunds,
    redeemGiftCard,
    notifications,
    markNotificationAsRead,
    deleteNotification,
    fetchUserNotifications
  } = useAuth();
  
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('personal'); // personal, addresses, coupons, supercoin, plus, wallet, giftcards, notifications
  
  // Sync tab state from URL parameter (?tab=wallet)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');

  // Wallet Form State
  const [walletAmount, setWalletAmount] = useState('');
  const [walletError, setWalletError] = useState('');
  const [walletSuccess, setWalletSuccess] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);

  // Saved Cards Form State
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardType, setCardType] = useState('Visa');
  const [cardError, setCardError] = useState('');
  const [cardSuccess, setCardSuccess] = useState('');
  const [cardLoading, setCardLoading] = useState(false);

  // Gift Card Form State
  const [giftCode, setGiftCode] = useState('');
  const [giftPin, setGiftPin] = useState('');
  const [giftError, setGiftError] = useState('');
  const [giftSuccess, setGiftSuccess] = useState('');
  const [giftLoading, setGiftLoading] = useState(false);

  // Copied State for Coupons
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // Static Coupons details
  const promoCoupons = [
    { code: 'FLIPKART20', desc: 'Get 20% instant discount on orders above ₹1,000.', type: 'Percentage', minOrder: 1000 },
    { code: 'WELCOME100', desc: 'Flat ₹100 discount on your first order above ₹500.', type: 'Fixed', minOrder: 500 }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (password && password !== confirmPassword) {
      return setProfileError('Passwords do not match.');
    }

    setUpdating(true);
    try {
      const payload = { name, email };
      if (password) payload.password = password;
      await updateProfile(payload);
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  // Address CRUD
  const handleOpenEditAddress = (addr) => {
    setEditAddressId(addr._id);
    setAddrName(addr.name);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrZip(addr.zipCode);
    setAddrPhone(addr.phone);
    setAddrDefault(addr.isDefault);
    setShowAddressForm(true);
  };

  const handleOpenAddAddress = () => {
    setEditAddressId(null);
    setAddrName('');
    setAddrStreet('');
    setAddrCity('');
    setAddrState('');
    setAddrZip('');
    setAddrPhone('');
    setAddrDefault(false);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrSuccess('');

    if (!addrName || !addrStreet || !addrCity || !addrState || !addrZip || !addrPhone) {
      return setAddrError('Please complete all address fields.');
    }

    try {
      const addressData = {
        name: addrName,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        phone: addrPhone,
        isDefault: addrDefault
      };

      if (editAddressId) {
        await updateAddress(editAddressId, addressData);
        setAddrSuccess('Address updated successfully!');
      } else {
        await addAddress(addressData);
        setAddrSuccess('Address saved successfully!');
      }

      setShowAddressForm(false);
      setEditAddressId(null);
    } catch (err) {
      setAddrError(err.message || 'Failed to save address details.');
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addrId);
      } catch (err) {
        alert('Failed to delete address.');
      }
    }
  };

  // Wallet Add Funds
  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    setWalletError('');
    setWalletSuccess('');

    if (!walletAmount || Number(walletAmount) <= 0) {
      return setWalletError('Please enter a valid amount.');
    }

    setWalletLoading(true);
    try {
      await addWalletFunds(Number(walletAmount));
      setWalletSuccess(`Successfully added ₹${walletAmount} to your wallet balance.`);
      setWalletAmount('');
    } catch (err) {
      setWalletError(err.message || 'Failed to add funds.');
    } finally {
      setWalletLoading(false);
    }
  };

  // Save Mock Card
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setCardError('');
    setCardSuccess('');

    if (!cardHolder || !cardNumber || !cardExpiry) {
      return setCardError('Please fill out all card fields.');
    }

    setCardLoading(true);
    try {
      await addSavedCard({
        cardHolder,
        cardNumber,
        expiryDate: cardExpiry,
        cardType
      });
      setCardSuccess('Card saved successfully!');
      setCardHolder('');
      setCardNumber('');
      setCardExpiry('');
      setShowCardForm(false);
    } catch (err) {
      setCardError(err.message || 'Failed to save card.');
    } finally {
      setCardLoading(false);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteSavedCard(cardId);
      } catch (err) {
        alert('Failed to delete card.');
      }
    }
  };

  // Redeem Gift Card
  const handleGiftCardSubmit = async (e) => {
    e.preventDefault();
    setGiftError('');
    setGiftSuccess('');

    if (!giftCode || !giftPin) {
      return setGiftError('Please provide both Voucher Code and PIN.');
    }

    setGiftLoading(true);
    try {
      const data = await redeemGiftCard(giftCode, giftPin);
      setGiftSuccess(`Voucher redeemed successfully! ₹${data.amountRedeemed} has been added to your wallet.`);
      setGiftCode('');
      setGiftPin('');
    } catch (err) {
      setGiftError(err.message || 'Validation error. Please verify the code/PIN.');
    } finally {
      setGiftLoading(false);
    }
  };

  // Copy Coupon Code
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 3000);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please log in to view profile details.</p>
      </div>
    );
  }

  // Sidebar Menu mapping to Flipkart menu items
  const menuItems = [
    { id: 'personal', label: 'My Profile', icon: User },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'supercoin', label: 'Supercoin', icon: Award },
    { id: 'plus', label: 'Flipkart Plus Zone', icon: Sparkles },
    { id: 'wallet', label: 'Saved Cards & Wallet', icon: CreditCard },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'giftcards', label: 'Gift Cards', icon: Gift },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.filter(n => !n.isRead).length }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Navigation Menu */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm shadow-sm transition-colors overflow-hidden">
          
          <div className="p-5 bg-flipkart-blue text-white flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg border">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-blue-150 font-bold uppercase tracking-wider block">Hello,</span>
              <span className="text-base font-extrabold block truncate max-w-[200px]">{user.name}</span>
            </div>
          </div>

          <div className="flex flex-col py-1 text-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setShowAddressForm(false);
                    setShowCardForm(false);
                    // Update URL params
                    navigate(`/profile?tab=${item.id}`);
                  }}
                  className={`px-5 py-3 text-left font-semibold flex items-center justify-between transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50/40 dark:bg-zinc-800/40 text-flipkart-blue dark:text-blue-400 border-l-4 border-flipkart-blue' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 text-gray-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-flipkart-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Side: Tab Contents Area */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-6 shadow-sm transition-colors min-h-[400px]">
          
          {/* 1. PERSONAL DETAILS VIEW */}
          {activeTab === 'personal' && (
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5">Personal Information</h3>
              
              <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4 max-w-lg">
                {profileError && <p className="text-xs text-red-600 font-bold">{profileError}</p>}
                {profileSuccess && <p className="text-xs text-green-600 font-bold">{profileSuccess}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-800 text-sm px-3.5 py-2 border border-gray-250 dark:border-zinc-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-800 text-sm px-3.5 py-2 border border-gray-250 dark:border-zinc-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 mt-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-flipkart-blue" /> Change password</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-50 dark:bg-zinc-800 text-sm px-3.5 py-2 border border-gray-250 dark:border-zinc-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-50 dark:bg-zinc-800 text-sm px-3.5 py-2 border border-gray-250 dark:border-zinc-700 rounded-sm focus:outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-6 py-2.5 rounded-sm self-start shadow-sm mt-3 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'SAVING CHANGES...' : 'SAVE CHANGES'}
                </button>
              </form>
            </div>
          )}

          {/* 2. COUPONS VIEW */}
          {activeTab === 'coupons' && (
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-5">Available Coupons</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promoCoupons.map((coupon) => (
                  <div key={coupon.code} className="border border-dashed border-gray-300 dark:border-zinc-750 bg-gray-50/50 dark:bg-zinc-800/20 p-4 rounded flex flex-col justify-between items-start gap-4">
                    <div>
                      <span className="font-mono bg-yellow-100 dark:bg-yellow-950/40 px-2.5 py-1 text-xs font-black tracking-wider text-yellow-800 dark:text-yellow-400 rounded">
                        {coupon.code}
                      </span>
                      <p className="text-xs text-gray-650 dark:text-zinc-400 font-semibold mt-3">{coupon.desc}</p>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="text-xs font-bold text-flipkart-blue dark:text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      {copiedCoupon === coupon.code ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCoupon === coupon.code ? 'COPIED!' : 'COPY CODE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SUPERCOIN VIEW */}
          {activeTab === 'supercoin' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3">Supercoin loyalty Balance</h3>
              
              {/* Coin card */}
              <div className="bg-gradient-to-br from-amber-400 to-amber-500 text-gray-950 p-6 rounded-sm shadow flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-950/70 block">Available Balance</span>
                  <span className="text-3xl font-black flex items-center gap-1.5 mt-1">
                    <Award className="w-8 h-8 fill-amber-950/20 text-amber-950" /> {user.supercoins || 0} Coins
                  </span>
                </div>
                <div className="text-xs text-right text-amber-950 font-semibold leading-relaxed hidden sm:block">
                  1 Supercoin = ₹1 saved on shopping<br />
                  Earn coins on every delivery
                </div>
              </div>

              {/* Transactions Ledger */}
              <div className="border border-gray-150 dark:border-zinc-800 rounded p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-3">Supercoin Activity history</h4>
                
                <div className="divide-y text-xs divide-gray-100 dark:divide-zinc-800">
                  <div className="py-2.5 flex justify-between items-center text-gray-700 dark:text-zinc-400">
                    <div>
                      <span className="font-bold text-gray-850 dark:text-white block">Welcome Coins Credited</span>
                      <span className="text-[10px] text-gray-400">Seeded on account creation</span>
                    </div>
                    <span className="font-bold text-green-600 font-mono text-sm">+45 Coins</span>
                  </div>
                  
                  {user.supercoins > 45 && (
                    <div className="py-2.5 flex justify-between items-center text-gray-700 dark:text-zinc-400">
                      <div>
                        <span className="font-bold text-gray-850 dark:text-white block">Earned on order purchases</span>
                        <span className="text-[10px] text-gray-400">Order Delivery bonus</span>
                      </div>
                      <span className="font-bold text-green-600 font-mono text-sm">+{user.supercoins - 45} Coins</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. FLIPKART PLUS ZONE VIEW */}
          {activeTab === 'plus' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3">Flipkart Plus Zone</h3>
              
              {user.supercoins >= 100 ? (
                /* Plus Member active card */
                <div className="bg-zinc-900 text-white p-6 rounded-sm border border-zinc-850 shadow flex items-center justify-between">
                  <div>
                    <span className="bg-flipkart-blue text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block w-max mb-2">Active</span>
                    <h4 className="text-lg font-black flex items-center gap-1">
                      You are a <span className="text-flipkart-yellow font-extrabold italic">Flipkart Plus</span> Member!
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1.5">Enjoy unlocked early access, free shipping, and discount privileges.</p>
                  </div>
                  <Sparkles className="w-12 h-12 text-flipkart-yellow animate-pulse" />
                </div>
              ) : (
                /* Plus Member unlock requirements card */
                <div className="bg-gray-50 dark:bg-zinc-850 p-6 rounded border flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-flipkart-yellow-dark" /> Unlock Flipkart Plus Membership
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      Earn 100 Supercoins to unlock premium shopping privileges.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-zinc-400 font-bold">
                      <span>{user.supercoins || 0} / 100 Coins</span>
                      <span>{100 - (user.supercoins || 0)} coins needed</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-flipkart-blue h-full rounded-full" style={{ width: `${Math.min(100, user.supercoins)}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plus Zone Benefits */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3.5">Plus Membership Benefits</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="border rounded p-4 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 text-flipkart-blue flex items-center justify-center font-bold">1</div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">Free Fast Shipping</span>
                    <p className="text-[10px] text-gray-500">Free delivery on plus catalog products without minimum order amount.</p>
                  </div>
                  <div className="border rounded p-4 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/20 text-green-600 flex items-center justify-center font-bold">2</div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">Early Sales Access</span>
                    <p className="text-[10px] text-gray-500">Shop seasonal mega deals and sales 24 hours before standard accounts.</p>
                  </div>
                  <div className="border rounded p-4 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center font-bold">3</div>
                    <span className="text-xs font-bold text-gray-800 dark:text-white">2x Supercoins Earn</span>
                    <p className="text-[10px] text-gray-500">Earn double supercoins rates compared to standard user profiles.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 5. SAVED CARDS & WALLET VIEW */}
          {activeTab === 'wallet' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3">Wallet & Saved Cards</h3>
              
              {/* Wallet details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-150 dark:border-zinc-800 rounded p-5 flex flex-col justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Wallet Balance</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white mt-1.5 block">
                      ₹{user.walletBalance?.toLocaleString('en-IN') || '0'}
                    </span>
                  </div>
                  
                  <form onSubmit={handleWalletSubmit} className="w-full flex gap-2">
                    <input
                      type="number"
                      placeholder="Add Amount (₹)"
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-800 text-xs px-3 py-2 border rounded-sm outline-none flex-1 focus:ring-1 focus:ring-flipkart-blue"
                    />
                    <button
                      type="submit"
                      disabled={walletLoading}
                      className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-4 py-2 rounded-sm"
                    >
                      {walletLoading ? 'ADDING...' : 'ADD FUNDS'}
                    </button>
                  </form>
                  {walletError && <p className="text-[10px] text-red-600 font-bold">{walletError}</p>}
                  {walletSuccess && <p className="text-[10px] text-green-600 font-bold">{walletSuccess}</p>}
                </div>

                <div className="bg-gray-50 dark:bg-zinc-800/10 p-5 rounded border flex flex-col justify-between text-xs text-gray-500">
                  <span className="font-bold text-gray-850 dark:text-white block mb-1">Easy Checkout Benefits</span>
                  <p>1. Pay with wallet balance instantly without standard SMS OTP steps.</p>
                  <p className="mt-1">2. Instant refund returns back to wallet account on cancellations.</p>
                  <p className="mt-1">3. Fully protected security sandbox constraints.</p>
                </div>
              </div>

              {/* Saved Cards */}
              <div className="border-t border-gray-100 dark:border-zinc-850 pt-4 mt-2">
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saved Cards</h4>
                  {!showCardForm && (
                    <button
                      onClick={() => setShowCardForm(true)}
                      className="text-xs font-bold text-flipkart-blue hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save Card
                    </button>
                  )}
                </div>

                {/* Add Card Form */}
                {showCardForm && (
                  <form onSubmit={handleCardSubmit} className="border rounded-sm p-4 bg-gray-50 dark:bg-zinc-800/25 mb-4 flex flex-col gap-3 max-w-md">
                    <h5 className="text-xs font-bold text-gray-400 uppercase block mb-1">Save credit/debit card</h5>
                    {cardError && <p className="text-xs text-red-600 font-bold">{cardError}</p>}

                    <input
                      type="text"
                      placeholder="Cardholder Name"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border outline-none"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Card Number"
                        maxLength="19"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border outline-none col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowCardForm(false)}
                        className="text-xs font-bold text-gray-500 hover:underline px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={cardLoading}
                        className="bg-flipkart-blue text-white font-bold text-xs px-4 py-1.5 rounded shadow-sm"
                      >
                        {cardLoading ? 'SAVING...' : 'SAVE CARD'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.savedCards?.length > 0 ? (
                    user.savedCards.map((card) => (
                      <div key={card._id} className="border border-gray-200 dark:border-zinc-800 p-4 rounded bg-white dark:bg-zinc-900 shadow-sm flex justify-between items-start">
                        <div className="text-xs text-gray-600 dark:text-zinc-400">
                          <span className="font-bold text-sm text-gray-850 dark:text-white block mb-1">
                            {card.cardHolder}
                          </span>
                          <p className="font-mono tracking-wider">{card.cardNumber}</p>
                          <p className="mt-1 text-[10px]">Expiry: {card.expiryDate} ({card.cardType})</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCard(card._id)}
                          className="p-1 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded border border-transparent hover:border-red-200"
                          title="Delete Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic col-span-full">No saved credit or debit cards found.</p>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* 6. SAVED ADDRESSES TAB */}
          {activeTab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between border-b pb-3 mb-5">
                <h3 className="text-base font-bold text-gray-800 dark:text-white">Manage Addresses</h3>
                {!showAddressForm && (
                  <button
                    onClick={handleOpenAddAddress}
                    className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-4 py-2 rounded-sm flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> ADD NEW ADDRESS
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddressSubmit} className="border border-gray-200 dark:border-zinc-700 rounded-sm p-4 bg-gray-50 dark:bg-zinc-800/20 mb-6 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase block mb-1">
                    {editAddressId ? 'Edit Address' : 'Add New Address'}
                  </h4>

                  {addrError && <p className="text-xs text-red-600 font-bold">{addrError}</p>}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Recipient Name"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-250 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                    <input
                      type="text"
                      placeholder="10-digit Phone Number"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-250 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Street Address, House No, Landmark"
                    value={addrStreet}
                    onChange={(e) => setAddrStreet(e.target.value)}
                    className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-250 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-250 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-250 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                    <input
                      type="text"
                      placeholder="ZipCode"
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-250 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-650 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={addrDefault}
                      onChange={(e) => setAddrDefault(e.target.checked)}
                      className="rounded text-flipkart-blue focus:ring-0 w-3.5 h-3.5 border-gray-300 dark:border-zinc-700"
                    />
                    <span>Set as default shipping address</span>
                  </label>

                  <div className="flex justify-end gap-2.5 mt-2">
                    <button
                      type="button"
                      onClick={() => { setShowAddressForm(false); setEditAddressId(null); }}
                      className="text-xs font-bold text-gray-500 hover:underline px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-5 py-2.5 rounded-sm shadow-sm"
                    >
                      SAVE ADDRESS
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="flex flex-col gap-3">
                {user.addresses?.length > 0 ? (
                  user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`
                        border rounded p-4 shadow-sm relative flex justify-between items-start transition-colors
                        ${addr.isDefault ? 'border-flipkart-blue bg-blue-50/10' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'}
                      `}
                    >
                      <div className="text-xs text-gray-600 dark:text-zinc-400">
                        <span className="font-extrabold text-sm text-gray-800 dark:text-white block mb-1">
                          {addr.name}
                          {addr.isDefault && (
                            <span className="ml-2.5 bg-flipkart-blue text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              DEFAULT
                            </span>
                          )}
                        </span>
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - <span className="font-semibold">{addr.zipCode}</span></p>
                        <p className="font-semibold mt-1">Phone: {addr.phone}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 bg-gray-50 dark:bg-zinc-800 text-gray-500 hover:text-flipkart-blue rounded border border-gray-150 hover:border-flipkart-blue transition-colors"
                          title="Edit Address"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr._id)}
                          className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 hover:text-red-500 rounded border border-red-150 hover:border-red-500 transition-colors"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic py-4">No shipping addresses saved yet.</p>
                )}
              </div>
            </div>
          )}

          {/* 7. GIFT CARDS VIEW */}
          {activeTab === 'giftcards' && (
            <div className="flex flex-col gap-6">
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3">Gift Cards</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Form to redeem */}
                <form onSubmit={handleGiftCardSubmit} className="border border-gray-150 dark:border-zinc-800 rounded p-5 flex flex-col gap-3.5 bg-white dark:bg-zinc-900 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 mb-1">Redeem Gift Card Voucher</h4>
                  
                  {giftError && <p className="text-xs text-red-600 font-bold">{giftError}</p>}
                  {giftSuccess && <p className="text-xs text-green-600 font-bold">{giftSuccess}</p>}

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="font-bold text-gray-500">Voucher Card Number (16 digits)</label>
                    <input
                      type="text"
                      maxLength="16"
                      placeholder="e.g. 1234567890123456"
                      value={giftCode}
                      onChange={(e) => setGiftCode(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="font-bold text-gray-500">Voucher PIN (6 digits)</label>
                    <input
                      type="password"
                      maxLength="6"
                      placeholder="e.g. 123456"
                      value={giftPin}
                      onChange={(e) => setGiftPin(e.target.value)}
                      className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={giftLoading}
                    className="bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-2.5 rounded-sm text-xs shadow-sm mt-1"
                  >
                    {giftLoading ? 'VALIDATING...' : 'REDEEM GIFT CARD'}
                  </button>
                </form>

                {/* Static Seed Info Block */}
                <div className="bg-blue-50/20 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900 p-5 rounded text-xs flex flex-col gap-3 text-gray-650 dark:text-zinc-400">
                  <h4 className="font-bold text-gray-800 dark:text-white flex items-center gap-1"><ShieldCheck className="w-4.5 h-4.5 text-flipkart-blue" /> Seed Credentials for Testing:</h4>
                  <p>You can use these seeded gift voucher credentials to add funds directly to your wallet for testing purposes:</p>
                  <div className="bg-white dark:bg-zinc-900 border p-3.5 rounded flex flex-col gap-1 font-mono text-[11px] text-gray-850 dark:text-zinc-200">
                    <p>Card Number: <span className="font-bold select-all">1234567890123456</span></p>
                    <p>PIN: <span className="font-bold select-all">123456</span></p>
                    <p>Value: <span className="text-green-600 font-bold">₹500</span></p>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border p-3.5 rounded flex flex-col gap-1 font-mono text-[11px] text-gray-850 dark:text-zinc-200">
                    <p>Card Number: <span className="font-bold select-all">9876543210987654</span></p>
                    <p>PIN: <span className="font-bold select-all">654321</span></p>
                    <p>Value: <span className="text-green-600 font-bold">₹1000</span></p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 8. NOTIFICATIONS VIEW */}
          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white border-b pb-3 mb-4 flex justify-between items-center">
                <span>Notifications History ({notifications.length})</span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => fetchUserNotifications()}
                    className="text-xs text-flipkart-blue dark:text-blue-400 hover:underline"
                  >
                    Refresh
                  </button>
                )}
              </h3>

              <div className="flex flex-col gap-3">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.isRead && markNotificationAsRead(notif._id)}
                      className={`
                        border rounded p-4 relative flex justify-between items-start gap-4 transition-colors cursor-pointer shadow-sm
                        ${notif.isRead ? 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900' : 'border-blue-150 bg-blue-50/10 dark:bg-blue-950/10'}
                      `}
                    >
                      <div className="text-xs text-gray-600 dark:text-zinc-400 flex-1">
                        
                        {/* Title & read dot */}
                        <div className="flex items-center gap-2 mb-1.5">
                          {!notif.isRead && (
                            <span className="w-2.5 h-2.5 bg-flipkart-blue rounded-full flex-shrink-0 animate-pulse"></span>
                          )}
                          <span className="font-extrabold text-sm text-gray-850 dark:text-white">
                            {notif.title}
                          </span>
                        </div>

                        <p className="text-gray-700 dark:text-zinc-300 pr-4">{notif.message}</p>
                        
                        <span className="text-[10px] text-gray-400 block mt-2 font-semibold">
                          {new Date(notif.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="p-1 bg-gray-50 dark:bg-zinc-800 text-gray-400 hover:text-red-500 rounded border border-gray-150 hover:border-red-150 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic py-4 text-center">No notifications found.</p>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Profile;
