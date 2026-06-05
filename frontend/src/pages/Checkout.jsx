import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Plus, Check, CreditCard, Landmark, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm = ({ selectedAddress, paymentMethod, setPaymentMethod, onOrderSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { billingBreakdown, clearCart, coupon } = useCart();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedAddress) {
      setError('Please select a shipping address.');
      return;
    }

    setError(null);
    setProcessing(true);

    try {
      const orderItems = billingBreakdown.items.map(item => ({
        name: item.product.title,
        qty: item.quantity,
        image: item.product.images[0],
        price: item.product.price,
        product: item.product._id
      }));

      const orderPayload = {
        orderItems,
        shippingAddress: selectedAddress,
        paymentMethod,
        itemsPrice: billingBreakdown.sellingPriceTotal,
        taxPrice: Math.round(billingBreakdown.sellingPriceTotal * 0.18), // standard 18% GST representation
        shippingPrice: billingBreakdown.deliveryCharges,
        discountAmount: billingBreakdown.couponDiscount,
        totalPrice: billingBreakdown.netPayable,
      };

      if (paymentMethod === 'COD') {
        // Cash on Delivery
        const { data } = await API.post('/orders', {
          ...orderPayload,
          paymentResult: { id: `cod_${Date.now()}`, status: 'Pending', email_address: user.email }
        });
        await clearCart();
        onOrderSuccess(data._id);
      } else {
        // Card Payment (Stripe)
        // 1. Get Payment Intent client secret
        const { data: intentData } = await API.post('/payment/create-payment-intent', {
          amount: billingBreakdown.netPayable * 100 // convert to paise/cents
        });

        const { clientSecret, simulated } = intentData;

        let paymentResultId = '';
        let paymentResultStatus = '';

        if (simulated) {
          // Simulated mock payment flow
          console.log('[Stripe Simulation] Bypassing real card payment. Confirming mock payment...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // simulate load spinner
          paymentResultId = clientSecret;
          paymentResultStatus = 'succeeded';
        } else {
          // Real Stripe Payment flow
          if (!stripe || !elements) {
            throw new Error('Stripe is not initialized.');
          }

          const cardElement = elements.getElement(CardElement);
          const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: selectedAddress.name,
                email: user.email,
                phone: selectedAddress.phone
              }
            }
          });

          if (result.error) {
            throw new Error(result.error.message);
          }

          if (result.paymentIntent.status === 'succeeded') {
            paymentResultId = result.paymentIntent.id;
            paymentResultStatus = result.paymentIntent.status;
          } else {
            throw new Error('Card confirmation failed. Please try again.');
          }
        }

        // 2. Place order with payment result details
        const { data: orderData } = await API.post('/orders', {
          ...orderPayload,
          paymentResult: {
            id: paymentResultId,
            status: paymentResultStatus,
            email_address: user.email
          }
        });

        await clearCart();
        onOrderSuccess(orderData._id);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Payment placement failed. Please verify credentials.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmitOrder} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 p-3 rounded-sm text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Payment methods selectors */}
      <div className="flex flex-col gap-2.5">
        <label className={`
          flex items-center gap-3 border rounded p-4 cursor-pointer transition-colors
          ${paymentMethod === 'Card' ? 'border-flipkart-blue bg-blue-50/25 dark:bg-blue-950/10' : 'border-gray-200 dark:border-zinc-700'}
        `}>
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'Card'}
            onChange={() => setPaymentMethod('Card')}
            className="text-flipkart-blue focus:ring-0 w-4 h-4 border-gray-300 dark:border-zinc-600"
          />
          <CreditCard className="w-5 h-5 text-gray-500" />
          <div className="text-sm">
            <span className="font-bold block text-gray-800 dark:text-gray-150">Credit / Debit Card (Stripe)</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">Pay securely with Stripe gateway</span>
          </div>
        </label>

        <label className={`
          flex items-center gap-3 border rounded p-4 cursor-pointer transition-colors
          ${paymentMethod === 'COD' ? 'border-flipkart-blue bg-blue-50/25 dark:bg-blue-950/10' : 'border-gray-200 dark:border-zinc-700'}
        `}>
          <input
            type="radio"
            name="payment"
            checked={paymentMethod === 'COD'}
            onChange={() => setPaymentMethod('COD')}
            className="text-flipkart-blue focus:ring-0 w-4 h-4 border-gray-300 dark:border-zinc-600"
          />
          <Truck className="w-5 h-5 text-gray-500" />
          <div className="text-sm">
            <span className="font-bold block text-gray-800 dark:text-gray-150">Cash on Delivery (COD)</span>
            <span className="text-xs text-gray-400 dark:text-zinc-500">Pay in cash when product gets delivered</span>
          </div>
        </label>
      </div>

      {/* Stripe credit card inputs form element */}
      {paymentMethod === 'Card' && (
        <div className="border border-gray-200 dark:border-zinc-700 rounded p-4 bg-gray-50 dark:bg-zinc-800/40">
          <label className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-2.5">
            Card Details
          </label>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded p-3 text-sm">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '14px',
                    color: '#424770',
                    '::placeholder': { color: '#aab7c4' },
                  },
                  invalid: { color: '#9e2146' },
                },
              }}
            />
          </div>
          <span className="text-[10px] text-gray-400 dark:text-zinc-500 block mt-2">
            * Use any valid mock card numbers (e.g. 4242 4242 4242 4242) for testing checkout.
          </span>
        </div>
      )}

      {/* Complete trigger button */}
      <button
        type="submit"
        disabled={processing || !selectedAddress}
        className="w-full bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-3 rounded-sm text-sm shadow hover:shadow-card transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        {processing ? 'CONFIRMING ORDER...' : `CONFIRM AND PAY ₹${billingBreakdown.netPayable.toLocaleString('en-IN')}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { user, addAddress } = useAuth();
  const { billingBreakdown, cartItems } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1. Address, 2. Payment
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // New address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrError, setAddrError] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');

  // Set default address on load
  useEffect(() => {
    if (user && user.addresses?.length > 0) {
      const def = user.addresses.find(addr => addr.isDefault) || user.addresses[0];
      setSelectedAddress(def);
    }
  }, [user]);

  // If cart is empty, send back to home
  useEffect(() => {
    const active = cartItems.filter(item => !item.savedForLater);
    if (active.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrSuccess('');

    if (!addrName || !addrStreet || !addrCity || !addrState || !addrZip || !addrPhone) {
      setAddrError('Please fill out all address details.');
      return;
    }

    try {
      const updatedAddrs = await addAddress({
        name: addrName,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        phone: addrPhone
      });
      
      // select newly added address
      const newAddr = updatedAddrs[updatedAddrs.length - 1];
      setSelectedAddress(newAddr);
      setAddrSuccess('Address saved successfully!');
      
      // Clear fields
      setAddrName('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
      setAddrPhone('');
      setShowAddressForm(false);
    } catch (err) {
      setAddrError(err.message || 'Failed to save address.');
    }
  };

  const handleOrderSuccess = (orderId) => {
    navigate(`/order-confirmation/${orderId}`);
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please log in to proceed to checkout.</p>
        <Link to="/login?redirect=checkout" className="bg-flipkart-blue text-white font-bold px-6 py-2 rounded-sm text-sm">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      
      <div className="flex items-center gap-2 mb-6">
        <Link to="/cart" className="text-flipkart-blue hover:underline flex items-center gap-1 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Checkout Stepper Panels */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm shadow-sm transition-colors overflow-hidden">
            <div className={`
              px-4 py-3 flex justify-between items-center border-b transition-colors
              ${step === 1 ? 'bg-flipkart-blue text-white border-flipkart-blue' : 'bg-gray-50 dark:bg-zinc-850 text-gray-800 dark:text-white border-gray-150 dark:border-zinc-800'}
            `}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="bg-white text-flipkart-blue dark:bg-zinc-800 dark:text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-xs font-extrabold shadow-sm border border-gray-100 dark:border-zinc-700">1</span>
                DELIVERY ADDRESS
              </h3>
              {step > 1 && (
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-bold underline hover:text-flipkart-blue-dark dark:hover:text-blue-400 transition-colors"
                >
                  CHANGE
                </button>
              )}
            </div>

            {step === 1 && (
              <div className="p-4 flex flex-col gap-4">
                
                {/* User Address List */}
                {user.addresses?.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {user.addresses.map((addr) => (
                      <label
                        key={addr._id}
                        className={`
                          flex items-start gap-3 border rounded p-4 cursor-pointer transition-colors
                          ${selectedAddress?._id === addr._id ? 'border-flipkart-blue bg-blue-50/25 dark:bg-blue-950/10' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300'}
                        `}
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress?._id === addr._id}
                          onChange={() => setSelectedAddress(addr)}
                          className="mt-1 text-flipkart-blue focus:ring-0 w-4 h-4 border-gray-300 dark:border-zinc-600"
                        />
                        <div className="text-sm text-gray-700 dark:text-gray-200">
                          <span className="font-bold text-gray-900 dark:text-white block mb-1">
                            {addr.name} <span className="ml-2 bg-gray-100 dark:bg-zinc-800 text-[10px] text-gray-400 font-bold px-1.5 py-0.5 rounded uppercase">{addr.phone}</span>
                          </span>
                          <span className="block">{addr.street}</span>
                          <span className="block">{addr.city}, {addr.state} - <span className="font-semibold">{addr.zipCode}</span></span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No addresses saved yet. Please add a shipping address below.</p>
                )}

                {/* Create Address Form */}
                {!showAddressForm ? (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1.5 text-sm font-bold text-flipkart-blue dark:text-blue-400 hover:underline self-start mt-2"
                  >
                    <Plus className="w-4 h-4" /> Add a new address
                  </button>
                ) : (
                  <form onSubmit={handleAddAddressSubmit} className="border border-gray-200 dark:border-zinc-700 rounded p-4 bg-gray-50 dark:bg-zinc-800/40 flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">New Delivery Address</h4>
                    
                    {addrError && <p className="text-xs text-red-600 font-bold">{addrError}</p>}
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Recipient Name"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                      <input
                        type="text"
                        placeholder="10-digit Mobile Phone"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Street address, Flat/House no, Landmark"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                      <input
                        type="text"
                        placeholder="Pin ZipCode"
                        value={addrZip}
                        onChange={(e) => setAddrZip(e.target.value)}
                        className="bg-white dark:bg-zinc-900 text-xs p-2.5 rounded border border-gray-200 dark:border-zinc-700 outline-none focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs font-bold text-gray-500 hover:underline px-4 py-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-5 py-2 rounded-sm shadow-sm"
                      >
                        SAVE ADDRESS
                      </button>
                    </div>
                  </form>
                )}

                {/* Continue button */}
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedAddress}
                  className="bg-flipkart-orange hover:bg-flipkart-orange-dark text-white font-bold py-2.5 px-6 rounded-sm text-xs shadow hover:shadow-card self-start mt-2 transition-all disabled:opacity-50"
                >
                  DELIVER HERE
                </button>
              </div>
            )}
            
            {step > 1 && selectedAddress && (
              <div className="px-5 py-3.5 text-xs text-gray-500 dark:text-zinc-400 bg-gray-50/50 dark:bg-zinc-900/40">
                <span className="font-bold text-gray-800 dark:text-gray-150 block mb-0.5">{selectedAddress.name}</span>
                <p>{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode} | Phone: {selectedAddress.phone}</p>
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT INTERFACE */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm shadow-sm transition-colors overflow-hidden">
            <div className={`
              px-4 py-3 flex justify-between items-center border-b transition-colors
              ${step === 2 ? 'bg-flipkart-blue text-white border-flipkart-blue' : 'bg-gray-50 dark:bg-zinc-850 text-gray-800 dark:text-white border-gray-150 dark:border-zinc-800'}
            `}>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <span className="bg-white text-flipkart-blue dark:bg-zinc-800 dark:text-white rounded-full w-5.5 h-5.5 flex items-center justify-center text-xs font-extrabold shadow-sm border border-gray-100 dark:border-zinc-700">2</span>
                PAYMENT METHODS
              </h3>
            </div>

            {step === 2 && (
              <div className="p-4">
                <Elements stripe={stripePromise}>
                  <CheckoutForm
                    selectedAddress={selectedAddress}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    onOrderSuccess={handleOrderSuccess}
                  />
                </Elements>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Order Summary Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm shadow-sm transition-colors">
            
            <div className="border-b border-gray-100 dark:border-zinc-800 px-4 py-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Order Items Summary
              </h4>
            </div>

            {/* List short summary cards */}
            <div className="p-4 flex flex-col gap-3 max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
              {billingBreakdown.items.map((item) => (
                <div key={item.product._id} className="flex gap-3 pt-3 first:pt-0">
                  <img src={item.product.images[0]} alt="" className="w-10 h-10 object-contain bg-white rounded border p-0.5" />
                  <div className="flex-1 text-xs">
                    <span className="font-semibold block text-gray-700 dark:text-gray-300 line-clamp-1">{item.product.title}</span>
                    <span className="text-gray-400 block mt-0.5">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Price billing breakouts */}
            <div className="border-t border-gray-100 dark:border-zinc-800 p-4 flex flex-col gap-3 text-xs border-b">
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Price ({billingBreakdown.totalItemsCount} items)</span>
                <span>₹{billingBreakdown.mrpTotal.toLocaleString('en-IN')}</span>
              </div>
              {billingBreakdown.itemDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Product Discount</span>
                  <span>- ₹{billingBreakdown.itemDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-zinc-400">
                <span>Delivery Charges</span>
                <span className={billingBreakdown.deliveryCharges === 0 ? 'text-green-600 font-bold' : ''}>
                  {billingBreakdown.deliveryCharges === 0 ? 'FREE' : `₹${billingBreakdown.deliveryCharges}`}
                </span>
              </div>
              {billingBreakdown.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Savings</span>
                  <span>- ₹{billingBreakdown.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-dashed border-gray-150 dark:border-zinc-800 pt-3 flex justify-between font-extrabold text-sm text-gray-900 dark:text-white">
                <span>Total Payable</span>
                <span>₹{billingBreakdown.netPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold px-2">
            <ShieldCheck className="w-8 h-8 text-gray-400" />
            <span>Safe and Secure Checkout. Verified payment gateway. 100% security assured.</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
