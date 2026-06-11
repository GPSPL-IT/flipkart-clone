import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import API from '../services/api';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.order || data);
      } catch (err) {
        console.error('Error loading order summary for confirmation', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm p-8 shadow-sm transition-colors flex flex-col items-center">
        
        <CheckCircle2 className="w-16 h-16 text-green-600 mb-4 animate-bounce" />
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          Thank you for your purchase. Your order has been placed and is currently being prepared for shipment.
        </p>

        {loading ? (
          <div className="w-32 h-6 bg-gray-200 dark:bg-zinc-800 animate-pulse rounded mb-6"></div>
        ) : order ? (
          <div className="bg-gray-50 dark:bg-zinc-800/30 rounded border p-4 w-full text-left mb-6 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex justify-between border-b border-gray-150 dark:border-zinc-800 pb-2 mb-2 font-semibold">
              <span>Order ID:</span>
              <span className="font-mono text-xs text-gray-900 dark:text-white">{order._id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Items Count:</span>
              <span>{order.orderItems.reduce((acc, item) => acc + item.qty, 0)} items</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Paid Amount:</span>
              <span className="font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Shipping Address:</span>
              <span className="text-right max-w-xs">{order.shippingAddress.name}, {order.shippingAddress.city}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
          <Link
            to={`/order-tracking/${id}`}
            className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs py-3 px-6 rounded-sm shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Truck className="w-4 h-4" /> TRACK YOUR ORDER <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/"
            className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-250 dark:hover:bg-zinc-700 text-gray-800 dark:text-white font-bold text-xs py-3 px-6 rounded-sm flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> CONTINUE SHOPPING
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
