import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Truck, Users, Plus, Edit, Trash2, IndianRupee, AlertCircle, BarChart3, ListFilter } from 'lucide-react';
import API from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats'); // stats, products, orders, users
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Product CRUD Form States
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  const [prodTitle, setProdTitle] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscount, setProdDiscount] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodImages, setProdImages] = useState('');
  const [prodSpecs, setProdSpecs] = useState([{ name: '', value: '' }]);
  const [prodFeatured, setProdFeatured] = useState(false);
  const [prodTrending, setProdTrending] = useState(false);
  const [formError, setFormError] = useState('');

  // Protect Admin Route client-side
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch dashboard stats and lists
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const statsRes = await API.get('/admin/stats');
        setStats(statsRes.data);

        const prodRes = await API.get('/products', { params: { limit: 100 } });
        setProducts(prodRes.data.products || []);

        const orderRes = await API.get('/admin/orders');
        setOrders(orderRes.data || []);

        const userRes = await API.get('/admin/users');
        setUsers(userRes.data || []);

        const catRes = await API.get('/categories');
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Error loading admin control panel data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, activeTab]);

  // Product CRUD Action Handlers
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProdTitle('');
    setProdDesc('');
    setProdPrice('');
    setProdDiscount('');
    setProdBrand('');
    setProdCategory(categories[0]?._id || '');
    setProdStock('');
    setProdImages('');
    setProdSpecs([{ name: '', value: '' }]);
    setProdFeatured(false);
    setProdTrending(false);
    setFormError('');
    setShowProductForm(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProductId(prod._id);
    setProdTitle(prod.title);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdDiscount(prod.discountPercentage || 0);
    setProdBrand(prod.brand);
    setProdCategory(prod.category._id || prod.category);
    setProdStock(prod.stock);
    setProdImages(prod.images.join(', '));
    setProdSpecs(prod.specifications?.length > 0 ? [...prod.specifications] : [{ name: '', value: '' }]);
    setProdFeatured(prod.isFeatured || false);
    setProdTrending(prod.isTrending || false);
    setFormError('');
    setShowProductForm(true);
  };

  const handleAddSpecRow = () => {
    setProdSpecs(prev => [...prev, { name: '', value: '' }]);
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...prodSpecs];
    updated[index][field] = value;
    setProdSpecs(updated);
  };

  const handleRemoveSpecRow = (index) => {
    setProdSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!prodTitle || !prodDesc || !prodPrice || !prodBrand || !prodCategory || prodStock === '') {
      return setFormError('Please fill out all mandatory product fields.');
    }

    // Clean spec list (remove empty keys/values)
    const cleanedSpecs = prodSpecs.filter(spec => spec.name.trim() && spec.value.trim());

    // Clean image array
    const imageArray = prodImages
      .split(',')
      .map(img => img.trim())
      .filter(img => img.length > 0);

    const payload = {
      title: prodTitle,
      description: prodDesc,
      price: Number(prodPrice),
      discountPercentage: Number(prodDiscount || 0),
      brand: prodBrand,
      category: prodCategory,
      stock: Number(prodStock),
      images: imageArray,
      specifications: cleanedSpecs,
      isFeatured: prodFeatured,
      isTrending: prodTrending
    };

    try {
      if (editingProductId) {
        // PUT update
        const { data } = await API.put(`/admin/products/${editingProductId}`, payload);
        setProducts(prev => prev.map(p => p._id === editingProductId ? data : p));
      } else {
        // POST create
        const { data } = await API.post('/admin/products', payload);
        setProducts(prev => [data, ...prev]);
      }
      setShowProductForm(false);
      setEditingProductId(null);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit product details.');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/admin/products/${prodId}`);
        setProducts(prev => prev.filter(p => p._id !== prodId));
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  // Order status modification handler
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const descriptions = {
        Processing: 'Your order is currently being processed.',
        Shipped: 'Your order has been shipped and is on its way to you.',
        Delivered: 'Your order has been successfully delivered.',
        Cancelled: 'Your order was cancelled by the administrator.'
      };

      const { data } = await API.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        description: descriptions[newStatus]
      });

      // Update state local list
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status, trackingHistory: data.trackingHistory } : o));
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse flex flex-col gap-6">
        <div className="h-10 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Navigation Sidebar Panel */}
        <div className="w-full md:w-64 bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm shadow-sm transition-colors py-2 flex flex-col text-sm text-gray-700 dark:text-gray-300">
          <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
            ADMIN CONSOLE
          </div>
          <button
            onClick={() => { setActiveTab('stats'); setShowProductForm(false); }}
            className={`px-5 py-3.5 text-left font-semibold flex items-center gap-3 border-l-4 transition-colors ${
              activeTab === 'stats' ? 'bg-blue-50/40 dark:bg-zinc-800/40 border-flipkart-blue text-flipkart-blue dark:text-blue-400' : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard Analytics
          </button>
          <button
            onClick={() => { setActiveTab('products'); setShowProductForm(false); }}
            className={`px-5 py-3.5 text-left font-semibold flex items-center gap-3 border-l-4 transition-colors ${
              activeTab === 'products' ? 'bg-blue-50/40 dark:bg-zinc-800/40 border-flipkart-blue text-flipkart-blue dark:text-blue-400' : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" /> Manage Products
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setShowProductForm(false); }}
            className={`px-5 py-3.5 text-left font-semibold flex items-center gap-3 border-l-4 transition-colors ${
              activeTab === 'orders' ? 'bg-blue-50/40 dark:bg-zinc-800/40 border-flipkart-blue text-flipkart-blue dark:text-blue-400' : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Truck className="w-4.5 h-4.5" /> Manage Orders
          </button>
          <button
            onClick={() => { setActiveTab('users'); setShowProductForm(false); }}
            className={`px-5 py-3.5 text-left font-semibold flex items-center gap-3 border-l-4 transition-colors ${
              activeTab === 'users' ? 'bg-blue-50/40 dark:bg-zinc-800/40 border-flipkart-blue text-flipkart-blue dark:text-blue-400' : 'border-transparent hover:bg-gray-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4.5 h-4.5" /> Manage Users
          </button>
        </div>

        {/* Dashboard Main Workspace panel */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800 rounded-sm p-5 md:p-6 shadow-sm transition-colors overflow-hidden">
          
          {/* TAB 1: ANALYTICS DASHBOARD STATS */}
          {activeTab === 'stats' && stats && (
            <div className="flex flex-col gap-6">
              
              {/* Header metrics card shelf */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-gray-150 dark:border-zinc-850 bg-gray-50/40 dark:bg-zinc-900 p-4 rounded-sm shadow-sm flex items-center gap-3.5">
                  <div className="p-3 bg-blue-100 dark:bg-blue-950/20 text-flipkart-blue rounded-full">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Sales</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">₹{stats.counts.sales.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="border border-gray-150 dark:border-zinc-850 bg-gray-50/40 dark:bg-zinc-900 p-4 rounded-sm shadow-sm flex items-center gap-3.5">
                  <div className="p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-600 rounded-full">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Orders</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">{stats.counts.orders}</span>
                  </div>
                </div>

                <div className="border border-gray-150 dark:border-zinc-850 bg-gray-50/40 dark:bg-zinc-900 p-4 rounded-sm shadow-sm flex items-center gap-3.5">
                  <div className="p-3 bg-green-100 dark:bg-green-950/20 text-green-600 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Users</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">{stats.counts.users}</span>
                  </div>
                </div>

                <div className="border border-gray-150 dark:border-zinc-850 bg-gray-50/40 dark:bg-zinc-900 p-4 rounded-sm shadow-sm flex items-center gap-3.5">
                  <div className="p-3 bg-teal-100 dark:bg-teal-950/20 text-teal-600 rounded-full">
                    <ListFilter className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Products</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">{stats.counts.products}</span>
                  </div>
                </div>
              </div>

              {/* Monthly Sales Revenue Chart representations using pure CSS horizontal columns */}
              <div className="border border-gray-150 dark:border-zinc-800 rounded p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-flipkart-blue" /> Monthly Sales Chart</h4>
                
                {stats.chartData && stats.chartData.length > 0 ? (
                  <div className="flex flex-col gap-3.5 max-w-xl">
                    {stats.chartData.map((item, idx) => {
                      // find max revenue to calculate ratios
                      const maxVal = Math.max(...stats.chartData.map(c => c.revenue));
                      const percentWidth = maxVal > 0 ? (item.revenue / maxVal) * 100 : 0;
                      return (
                        <div key={idx} className="flex items-center gap-3 text-xs">
                          <span className="w-16 font-bold text-gray-600 dark:text-zinc-400">{item.month}</span>
                          <div className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-sm h-5 overflow-hidden relative">
                            <div className="bg-flipkart-blue h-full rounded-sm" style={{ width: `${Math.max(4, percentWidth)}%` }}></div>
                            <span className="absolute inset-y-0 right-3 flex items-center font-bold text-[10px] text-gray-500 dark:text-zinc-300">
                              ₹{item.revenue.toLocaleString('en-IN')} ({item.orders} orders)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No sales logs recorded yet. Complete an order checkout to populate chart.</p>
                )}
              </div>

              {/* Low stock notifications & recent orders grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Low Stock Alerts */}
                <div className="border border-gray-150 dark:border-zinc-850 rounded p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-flipkart-orange" /> Stock Warning Notifications</h4>
                  {stats.lowStockProducts?.length > 0 ? (
                    <div className="divide-y text-xs">
                      {stats.lowStockProducts.map((p) => (
                        <div key={p._id} className="py-2.5 flex justify-between items-center text-gray-700 dark:text-zinc-400 first:pt-0 last:pb-0">
                          <div>
                            <span className="font-bold block text-gray-800 dark:text-white truncate max-w-[200px]">{p.title}</span>
                            <span className="text-[10px] text-gray-400 uppercase">{p.brand}</span>
                          </div>
                          <span className="font-black text-red-500 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-950">
                            {p.stock} left
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">All products are healthy in stock levels!</p>
                  )}
                </div>

                {/* Recent Purchases */}
                <div className="border border-gray-150 dark:border-zinc-850 rounded p-4 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Recent Orders</h4>
                  {stats.recentOrders?.length > 0 ? (
                    <div className="divide-y text-xs">
                      {stats.recentOrders.map((o) => (
                        <div key={o._id} className="py-2.5 flex justify-between items-center text-gray-700 dark:text-zinc-400 first:pt-0 last:pb-0">
                          <div>
                            <span className="font-bold text-gray-800 dark:text-white block">₹{o.totalPrice.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-gray-400">{o.user?.email || 'Guest User'}</span>
                          </div>
                          <span className="font-semibold text-gray-400">{o.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No checkout history records found.</p>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MANAGE PRODUCTS CATALOG (CRUD LISTING & EDIT FORM) */}
          {activeTab === 'products' && (
            <div>
              {!showProductForm ? (
                /* PRODUCTS LIST TABLE VIEW */
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-3.5">
                    <h3 className="text-base font-bold text-gray-850 dark:text-white">Product Catalog ({products.length})</h3>
                    <button
                      onClick={handleOpenAddProduct}
                      className="bg-flipkart-blue hover:bg-flipkart-blue-dark text-white font-bold text-xs px-4 py-2 rounded-sm flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> ADD NEW PRODUCT
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded border border-gray-150 dark:border-zinc-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-150 dark:border-zinc-800 text-gray-400 font-bold uppercase tracking-wider">
                          <th className="py-3.5 px-4">Image</th>
                          <th className="py-3.5 px-4">Product Title</th>
                          <th className="py-3.5 px-4">Brand</th>
                          <th className="py-3.5 px-4">Selling Price</th>
                          <th className="py-3.5 px-4">Stock</th>
                          <th className="py-3.5 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-zinc-300">
                        {products.map((prod) => (
                          <tr key={prod._id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/25">
                            <td className="py-2.5 px-4">
                              <img src={prod.images[0]} alt="" className="w-10 h-10 object-contain bg-white rounded border border-gray-100 p-0.5" />
                            </td>
                            <td className="py-2.5 px-4 font-bold text-gray-850 dark:text-white truncate max-w-[200px]" title={prod.title}>
                              {prod.title}
                            </td>
                            <td className="py-2.5 px-4 font-semibold text-gray-500 uppercase">{prod.brand}</td>
                            <td className="py-2.5 px-4 font-bold">₹{prod.price.toLocaleString('en-IN')}</td>
                            <td className="py-2.5 px-4 font-semibold">
                              <span className={prod.stock < 5 ? 'text-red-500 font-bold' : ''}>{prod.stock}</span>
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 rounded border border-gray-150 hover:border-flipkart-blue hover:text-flipkart-blue transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod._id)}
                                  className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 hover:text-red-500 rounded border border-red-150 hover:border-red-500 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* PRODUCT CREATE/EDIT FORM VIEW */
                <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-gray-850 dark:text-white">
                      {editingProductId ? 'Edit Product Details' : 'Add New Catalog Product'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="text-xs font-bold text-gray-500 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>

                  {formError && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold p-3 rounded-sm">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Product Title</label>
                      <input
                        type="text"
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        placeholder="e.g. Apple iPhone 15 Pro Max"
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Brand Name</label>
                      <input
                        type="text"
                        value={prodBrand}
                        onChange={(e) => setProdBrand(e.target.value)}
                        placeholder="e.g. Apple"
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Price (Selling Price, ₹)</label>
                      <input
                        type="number"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        placeholder="e.g. 159900"
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Discount Percentage (%)</label>
                      <input
                        type="number"
                        value={prodDiscount}
                        onChange={(e) => setProdDiscount(e.target.value)}
                        placeholder="e.g. 6"
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Stock Units Level</label>
                      <input
                        type="number"
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        placeholder="e.g. 15"
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Department Category</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue text-gray-700 dark:text-gray-250"
                      >
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name} {c.parentCategory ? `(${c.parentCategory.name} sub)` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-bold text-gray-400 uppercase">Image URLs (comma-separated)</label>
                      <input
                        type="text"
                        value={prodImages}
                        onChange={(e) => setProdImages(e.target.value)}
                        placeholder="url1, url2"
                        className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs">
                    <label className="font-bold text-gray-400 uppercase">Product Details Description</label>
                    <textarea
                      rows="3"
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      placeholder="Share high-quality details about product performance features..."
                      className="bg-gray-50 dark:bg-zinc-800 border p-2.5 rounded-sm outline-none text-sm focus:ring-1 focus:ring-flipkart-blue"
                    ></textarea>
                  </div>

                  {/* Specifications list editors */}
                  <div className="border border-gray-150 dark:border-zinc-850 rounded p-4">
                    <div className="flex items-center justify-between border-b pb-2 mb-3">
                      <label className="text-xs font-bold text-gray-400 uppercase">Specifications List</label>
                      <button
                        type="button"
                        onClick={handleAddSpecRow}
                        className="text-xs font-bold text-flipkart-blue hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-2.5">
                      {prodSpecs.map((spec, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <input
                            type="text"
                            placeholder="Spec Name (e.g. RAM)"
                            value={spec.name}
                            onChange={(e) => handleSpecChange(idx, 'name', e.target.value)}
                            className="bg-white dark:bg-zinc-900 border p-2 rounded w-1/3 text-xs outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Spec Value (e.g. 16 GB)"
                            value={spec.value}
                            onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                            className="bg-white dark:bg-zinc-900 border p-2 rounded flex-1 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecRow(idx)}
                            className="p-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded border transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlight toggles checks */}
                  <div className="flex gap-6 items-center text-xs mt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-zinc-350">
                      <input
                        type="checkbox"
                        checked={prodFeatured}
                        onChange={(e) => setProdFeatured(e.target.checked)}
                        className="rounded text-flipkart-blue focus:ring-0 w-4 h-4 border-gray-300 dark:border-zinc-750"
                      />
                      <span>Feature in Carousel / Hot Deals</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-zinc-350">
                      <input
                        type="checkbox"
                        checked={prodTrending}
                        onChange={(e) => setProdTrending(e.target.checked)}
                        className="rounded text-flipkart-blue focus:ring-0 w-4 h-4 border-gray-300 dark:border-zinc-750"
                      />
                      <span>Flag as Trending Shelf Item</span>
                    </label>
                  </div>

                  {/* Submission buttons */}
                  <div className="flex justify-end gap-2.5 mt-4 border-t pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="text-xs font-bold text-gray-500 hover:underline px-4 py-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-2.5 rounded-sm shadow-sm"
                    >
                      {editingProductId ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: MANAGE ORDERS (ORDERS LIST & STATUS UPDATES DROPDOWN) */}
          {activeTab === 'orders' && (
            <div>
              <h3 className="text-base font-bold text-gray-850 dark:text-white border-b pb-3.5 mb-4">Customer Orders Catalog ({orders.length})</h3>
              
              <div className="overflow-x-auto rounded border border-gray-150 dark:border-zinc-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-150 dark:border-zinc-800 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Total Price</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-zinc-300">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/25">
                        <td className="py-3 px-4 font-mono text-[10px] text-gray-900 dark:text-white font-bold">{o._id}</td>
                        <td className="py-3 px-4 text-gray-550">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="py-3 px-4 truncate max-w-[150px] font-semibold" title={o.user?.email}>{o.user?.email || 'Guest User'}</td>
                        <td className="py-3 px-4 font-bold text-gray-905 dark:text-white">₹{o.totalPrice.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4">
                          <span className={`
                            text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider
                            ${
                              o.status === 'Processing' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                              o.status === 'Shipped' ? 'text-blue-600 bg-blue-50 border-blue-200' :
                              o.status === 'Delivered' ? 'text-green-600 bg-green-50 border-green-200' :
                              'text-red-650 bg-red-50 border-red-200'
                            }
                          `}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={o.status}
                            disabled={o.status === 'Delivered' || o.status === 'Cancelled'}
                            onChange={(e) => handleOrderStatusUpdate(o._id, e.target.value)}
                            className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs px-2 py-1 rounded outline-none font-semibold text-gray-700 dark:text-gray-250 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MANAGE USERS */}
          {activeTab === 'users' && (
            <div>
              <h3 className="text-base font-bold text-gray-850 dark:text-white border-b pb-3.5 mb-4">Registered Users ({users.length})</h3>
              
              <div className="overflow-x-auto rounded border border-gray-150 dark:border-zinc-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-150 dark:border-zinc-800 text-gray-400 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4">User ID</th>
                      <th className="py-3.5 px-4">Name</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role Privilege</th>
                      <th className="py-3.5 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800 text-gray-700 dark:text-zinc-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/40 dark:hover:bg-zinc-850/25">
                        <td className="py-3 px-4 font-mono text-[10px] text-gray-550">{u._id}</td>
                        <td className="py-3 px-4 font-bold text-gray-850 dark:text-white">{u.name}</td>
                        <td className="py-3 px-4 font-semibold text-gray-550">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`
                            text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase
                            ${u.role === 'admin' ? 'text-flipkart-blue bg-blue-50 border-blue-200' : 'text-gray-500 bg-gray-50 border-gray-200'}
                          `}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-550">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
