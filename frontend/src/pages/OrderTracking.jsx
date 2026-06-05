import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Package, Truck, Calendar, MapPin, CreditCard } from 'lucide-react';
import API from '../services/api';

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching tracking status details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse flex flex-col gap-6">
        <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-40 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-60 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We could not retrieve tracking information for this Order ID.</p>
        <Link to="/orders" className="bg-flipkart-blue text-white font-bold text-xs px-6 py-2 rounded-sm">
          Go back to Orders
        </Link>
      </div>
    );
  }

  // Helper values for step progress calculations
  const steps = ['Processing', 'Shipped', 'Delivered'];
  const currentStepIndex = steps.indexOf(order.status);
  const isCancelled = order.status === 'Cancelled';

  const getStepStatus = (index) => {
    if (isCancelled) return 'cancelled';
    if (index < currentStepIndex) return 'complete';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      
      <div className="flex items-center gap-2 mb-6">
        <Link to="/orders" className="text-flipkart-blue hover:underline flex items-center gap-1 text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to My Orders
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Status Alert Banner */}
        {isCancelled ? (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4 rounded-sm text-sm text-red-700 dark:text-red-400">
            <h3 className="font-bold">This Order has been Cancelled</h3>
            <p className="text-xs text-red-500 mt-1">If you have already paid, a refund will be processed to your source account within 5-7 business days.</p>
          </div>
        ) : null}

        {/* STEP-BY-STEP PROGRESS STEPPER */}
        {!isCancelled && (
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-6 shadow-sm transition-colors">
            <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-8">Order Tracking Progress</h3>
            
            {/* Horizontal Stepper */}
            <div className="relative flex justify-between items-center max-w-xl mx-auto">
              
              {/* Stepper connecting line progress background */}
              <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 dark:bg-zinc-800 z-0">
                <div
                  className="bg-green-600 h-full transition-all duration-500"
                  style={{
                    width: `${currentStepIndex === 0 ? '0%' : currentStepIndex === 1 ? '50%' : '100%'}`
                  }}
                ></div>
              </div>

              {/* Step dots */}
              {steps.map((label, idx) => {
                const status = getStepStatus(idx);
                return (
                  <div key={label} className="relative z-10 flex flex-col items-center">
                    
                    {/* Circle icon */}
                    <div className={`
                      w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                      ${status === 'complete' ? 'bg-green-600 border-green-600 text-white' : 
                        status === 'active' ? 'bg-white dark:bg-zinc-850 border-flipkart-blue text-flipkart-blue font-bold scale-110 shadow-sm' : 
                        'bg-white dark:bg-zinc-900 border-gray-300 dark:border-zinc-700 text-gray-300'}
                    `}>
                      {status === 'complete' ? <Check className="w-5 h-5" /> : idx + 1}
                    </div>

                    <span className={`
                      text-xs font-semibold mt-2.5 whitespace-nowrap
                      ${status === 'active' ? 'text-flipkart-blue dark:text-blue-400 font-bold' : 
                        status === 'complete' ? 'text-green-600' : 'text-gray-400'}
                    `}>
                      {label}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* Tracking Logs List */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-4 md:p-6 shadow-sm transition-colors">
          <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Activity Log</h3>
          
          <div className="relative pl-6 border-l-2 border-gray-200 dark:border-zinc-800 space-y-6 max-w-2xl">
            {order.trackingHistory.map((event, idx) => (
              <div key={idx} className="relative">
                {/* Event Dot */}
                <span className="absolute -left-[31px] top-1.5 w-4 h-4 bg-white dark:bg-zinc-900 border-2 border-flipkart-blue rounded-full"></span>
                
                <span className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  {event.status} <span className="text-[10px] text-gray-400 normal-case font-normal flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.timestamp).toLocaleString('en-IN')}</span>
                </span>
                <p className="text-xs text-gray-500 mt-1">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order details & delivery info cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Shipping Address & payment method */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-4 shadow-sm text-xs text-gray-600 dark:text-zinc-400 transition-colors flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider border-b pb-2">Delivery & Payment</h3>
            <div>
              <span className="font-bold text-gray-800 dark:text-gray-150 flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> Delivery Address
              </span>
              <p className="font-semibold text-gray-900 dark:text-white mb-0.5">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
              <p className="font-semibold mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
            
            <div className="border-t pt-2.5">
              <span className="font-bold text-gray-800 dark:text-gray-150 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-4 h-4 text-gray-400" /> Payment Details
              </span>
              <p>Mode: <span className="font-bold text-gray-900 dark:text-white">{order.paymentMethod}</span></p>
              <p>Status: <span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>{order.isPaid ? 'Paid' : 'Unpaid (COD)'}</span></p>
            </div>
          </div>

          {/* Pricing Breakdown Invoice summary */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-4 shadow-sm text-xs text-gray-600 dark:text-zinc-400 transition-colors flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider border-b pb-2">Invoice Summary</h3>
            
            {/* List short summaries */}
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="truncate max-w-[200px]">{item.name} (x{item.qty})</span>
                  <span>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-2 flex flex-col gap-2 text-gray-500">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{order.itemsPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span>₹{order.taxPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery charges</span>
                <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>- ₹{order.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-gray-900 dark:text-white border-t border-dashed pt-2">
                <span>Total Amount Paid</span>
                <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
