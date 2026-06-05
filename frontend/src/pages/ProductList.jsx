import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, Check, Star, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import API from '../services/api';

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters state
  const [availableBrands, setAvailableBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    setSelectedCategory(cat);
    
    const q = params.get('q') || '';
    // reset pagination on search query change
    setPage(1);
  }, [location.search]);

  // Load categories list for sidebar
  useEffect(() => {
    const fetchFiltersMetadata = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data.filter(c => !c.parentCategory)); // root categories only
      } catch (err) {
        console.error('Error fetching sidebar categories', err);
      }
    };
    fetchFiltersMetadata();
  }, []);

  // Fetch products matching the current filters, search keyword, and page
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams(location.search);
      const keyword = params.get('q') || '';

      const queryParams = {
        page,
        limit: 8,
        sort,
        keyword
      };

      if (selectedCategory) queryParams.category = selectedCategory;
      if (priceMin) queryParams.priceMin = priceMin;
      if (priceMax) queryParams.priceMax = priceMax;
      if (rating) queryParams.rating = rating;
      if (selectedBrands.length > 0) queryParams.brand = selectedBrands.join(',');

      try {
        const { data } = await API.get('/products', { params: queryParams });
        setProducts(data.products || []);
        setPages(data.pages || 1);
        setTotalProducts(data.totalProducts || 0);
        
        // Dynamically capture unique brands for matching checkbox lists
        if (data.brands) {
          setAvailableBrands(data.brands);
        }
      } catch (err) {
        console.error('Error listing filtered products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [location.search, selectedCategory, selectedBrands, priceMin, priceMax, rating, sort, page]);

  const handleBrandChange = (brandName) => {
    setPage(1);
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(prev => prev.filter(b => b !== brandName));
    } else {
      setSelectedBrands(prev => [...prev, brandName]);
    }
  };

  const handleClearAll = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceMin('');
    setPriceMax('');
    setRating('');
    setSort('newest');
    setPage(1);
    navigate('/search');
  };

  const params = new URLSearchParams(location.search);
  const keywordQuery = params.get('q') || '';

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 bg-gray-50 dark:bg-zinc-950 transition-colors">
      
      {/* Mobile Filters Trigger */}
      <div className="flex md:hidden items-center justify-between bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-3 rounded-sm mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          <Filter className="w-4 h-4 text-flipkart-blue" />
          <span>Filters</span>
        </button>
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="text-xs font-semibold bg-transparent text-gray-700 dark:text-gray-200 outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Filters */}
        <div className={`
          ${showMobileFilters ? 'block fixed inset-0 z-50 bg-white dark:bg-zinc-900 p-6 overflow-y-auto' : 'hidden'}
          md:block bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm shadow-sm p-4 transition-colors
        `}>
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3 mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>
            {(selectedCategory || selectedBrands.length > 0 || priceMin || priceMax || rating) && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-flipkart-blue dark:text-blue-400 hover:underline"
              >
                CLEAR ALL
              </button>
            )}
            {showMobileFilters && (
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-sm font-bold text-gray-400 md:hidden"
              >
                Close
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
              Categories
            </h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`text-sm text-left font-medium transition-colors ${
                  !selectedCategory ? 'text-flipkart-blue dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-flipkart-blue'
                }`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={`text-sm text-left pl-3 font-medium border-l border-gray-200 dark:border-zinc-800 transition-colors ${
                    selectedCategory === cat.slug ? 'text-flipkart-blue dark:text-blue-400 font-bold border-flipkart-blue' : 'text-gray-600 dark:text-gray-300 hover:text-flipkart-blue'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6 border-t border-gray-100 dark:border-zinc-800 pt-4">
            <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
              Price Range (₹)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                className="w-full bg-gray-50 dark:bg-zinc-800 text-xs px-2.5 py-1.5 rounded-sm border border-gray-200 dark:border-zinc-700 focus:outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                className="w-full bg-gray-50 dark:bg-zinc-800 text-xs px-2.5 py-1.5 rounded-sm border border-gray-200 dark:border-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Brands */}
          {availableBrands.length > 0 && (
            <div className="mb-6 border-t border-gray-100 dark:border-zinc-800 pt-4">
              <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
                Brand
              </h4>
              <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto">
                {availableBrands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="rounded text-flipkart-blue focus:ring-0 w-4 h-4 border-gray-300 dark:border-zinc-700"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Customer Rating */}
          <div className="mb-4 border-t border-gray-100 dark:border-zinc-800 pt-4">
            <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
              Customer Rating
            </h4>
            <div className="flex flex-col gap-3">
              {[4, 3, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => { setRating(rating === String(num) ? '' : String(num)); setPage(1); }}
                  className={`text-sm text-left flex items-center gap-2 hover:text-flipkart-blue transition-colors ${
                    rating === String(num) ? 'text-flipkart-blue dark:text-blue-400 font-bold' : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="flex items-center gap-0.5 bg-green-600 text-white font-bold text-[10px] px-1 py-0.5 rounded-sm">
                    {num} <Star className="w-2.5 h-2.5 fill-white" />
                  </span>
                  <span>& above</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Products Results List */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          
          {/* Header & desktop sort */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-sm shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-400">
                {keywordQuery ? (
                  <span>Showing results for "<span className="text-gray-800 dark:text-white font-bold">{keywordQuery}</span>"</span>
                ) : (
                  <span>Showing products in catalog</span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">({totalProducts} products found)</p>
            </div>

            {/* Desktop Sort Options */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Sort By:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: 'newest', label: 'Newest First' },
                  { value: 'priceAsc', label: 'Price: Low-High' },
                  { value: 'priceDesc', label: 'Price: High-Low' },
                  { value: 'rating', label: 'Customer Rating' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => { setSort(option.value); setPage(1); }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                      sort === option.value
                        ? 'bg-flipkart-blue text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid results */}
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((prod) => (
                  <ProductCard key={prod._id} product={prod} />
                ))}
              </div>

              {/* Pagination controls */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-8 border-t border-gray-200 dark:border-zinc-800 pt-6">
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pages }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-sm border text-sm font-semibold flex items-center justify-center transition-all ${
                          page === pageNum
                            ? 'bg-flipkart-blue text-white border-flipkart-blue'
                            : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(prev => Math.min(pages, prev + 1))}
                    disabled={page === pages}
                    className="px-3.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-sm text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-sm p-12 text-center shadow-sm border border-gray-200 dark:border-zinc-800 transition-colors flex flex-col items-center justify-center gap-3">
              <p className="text-gray-500 font-medium">Sorry, no products matched your filters.</p>
              <button
                onClick={handleClearAll}
                className="bg-flipkart-blue text-white font-bold text-xs px-5 py-2.5 rounded-sm hover:bg-flipkart-blue-dark flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default ProductList;
