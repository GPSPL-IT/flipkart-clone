import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import API from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/my-orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Error fetching user orders history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900';
      case 'Shipped':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900';
      case 'Delivered':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
      case 'Cancelled':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse flex flex-col gap-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-50 dark:bg-zinc-950 transition-colors">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-flipkart-blue" /> My Orders ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-sm border border-gray-200 dark:border-zinc-800 p-12 text-center shadow-sm flex flex-col items-center justify-center gap-3">
          <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
          <Link to="/" className="bg-flipkart-blue text-white font-bold text-xs px-5 py-2.5 rounded-sm hover:bg-flipkart-blue-dark">
            START SHOPPING
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/order-tracking/${order._id}`}
              className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-card transition-shadow shadow-sm"
            >
              
              {/* Items Summary details */}
              <div className="flex gap-4 items-center flex-1">
                <div className="flex -space-x-4 overflow-hidden p-1 self-start md:self-center">
                  {order.orderItems.slice(0, 3).map((item, index) => (
                    <img
                      key={index}
                      src={item.image}
                      alt=""
                      className="w-12 h-12 object-contain bg-white rounded border border-gray-150 dark:border-zinc-800 shadow-sm relative"
                      style={{ zIndex: 3 - index }}
                    />
                  ))}
                  {order.orderItems.length > 3 && (
                    <div className="w-12 h-12 rounded-full border border-gray-250 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 relative z-0">
                      +{order.orderItems.length - 3}
                    </div>
                  )}
                </div>

                <div className="text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-150 block line-clamp-1 max-w-sm">
                    {order.orderItems[0].name}
                    {order.orderItems.length > 1 ? ` & ${order.orderItems.length - 1} other items` : ''}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-semibold mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <span>Total: ₹{order.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-gray-100 dark:border-zinc-800 pt-3 md:pt-0">
                <span className={`
                  text-xs font-bold px-3 py-1 rounded border uppercase tracking-wider
                  ${getStatusColor(order.status)}
                `}>
                  {order.status}
                </span>
                
                <span className="text-xs text-flipkart-blue dark:text-blue-400 font-bold flex items-center gap-0.5 group">
                  Track Order <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>

            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
