import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Award, Zap, TrendingUp, Sparkles, Clock } from 'lucide-react';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Home = () => {
  const { user } = useAuth();
  
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Countdown timer state matching screenshot (starts at 8h 23m 3s for demo consistency, then counts down live)
  const [timeLeft, setTimeLeft] = useState(8 * 3600 + 23 * 60 + 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return {
      hrs: String(hrs).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
      secs: String(secs).padStart(2, '0')
    };
  };

  const { hrs, mins, secs } = formatTime(timeLeft);

  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80',
      title: 'Mega Electronics Sale',
      subtitle: 'Up to 50% Off on Smartphones & Laptops'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1600&auto=format&fit=crop&q=80',
      title: 'Fashion Blockbuster Deals',
      subtitle: 'Min 60% Off on Shirts, Sneakers & Dresses'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80',
      title: 'Home Makeover Carnival',
      subtitle: 'Best Offers on Kitchenware & Furniture'
    }
  ];

  // Auto scroll banners
  useEffect(() => {
    const bannerTimer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(bannerTimer);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchHomeProducts = async () => {
      try {
        const { data } = await API.get('/products/trending');
        setTrending(data.trending || []);
        setFeatured(data.featured || []);
        setTopRated(data.topRated || []);

        if (user) {
          const RVRes = await API.get('/auth/recently-viewed');
          setRecentlyViewed(RVRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching trending products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeProducts();
  }, [user]);

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <div className="pb-12 bg-gray-50 dark:bg-zinc-950 transition-colors duration-200">
      
      {/* Category Icons Bar */}
      <CategoryBar />

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-4 flex flex-col gap-5">
        
        {/* Banner Carousel */}
        <div className="relative h-40 sm:h-56 md:h-72 w-full overflow-hidden rounded shadow-sm">
          <div
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="min-w-full h-full relative group">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 sm:px-16 text-white">
                  <h2 className="text-lg sm:text-2xl font-extrabold mb-1 max-w-lg drop-shadow">
                    {banner.title}
                  </h2>
                  <p className="text-xs sm:text-base text-flipkart-yellow font-bold drop-shadow">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white text-zinc-800 p-2 rounded shadow-sm hover:scale-105 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white text-zinc-800 p-2 rounded shadow-sm hover:scale-105 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* SALE COUNTDOWN BANNER (Matches screenshot layout exactly) */}
        <div className="bg-blue-50 dark:bg-zinc-900 border border-blue-100 dark:border-zinc-800 rounded py-2 px-4 flex items-center justify-center gap-1.5 shadow-sm text-sm text-gray-700 dark:text-zinc-300 font-semibold transition-colors">
          <span>Sale ends in</span>
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-black tracking-wider shadow-sm">{hrs}</span> Hrs : 
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-black tracking-wider shadow-sm">{mins}</span> Min : 
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-black tracking-wider shadow-sm">{secs}</span> Sec
        </div>

        {/* PROMOTIONAL GRID BANNERS (3 Columns matching the screenshot cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Dry Fruits */}
          <div className="bg-[#fad34f] text-gray-950 p-5 rounded shadow-sm border border-yellow-250 flex justify-between items-center relative overflow-hidden h-44 hover:shadow-product transition-shadow">
            <div className="flex flex-col justify-between h-full z-10 max-w-[60%]">
              <div>
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase block w-max tracking-wider">GRWM Sale</span>
                <h4 className="text-base font-black leading-tight mt-2.5">Dry Fruits, Oil & more From ₹99</h4>
                <p className="text-[10px] text-gray-700 font-semibold mt-1">Don't miss out!</p>
              </div>
              <div className="bg-white/80 border border-yellow-300 rounded px-2 py-1 text-[9px] font-bold block w-max leading-tight mt-auto">
                <span className="text-blue-800">SBI Card</span> 10% instant discount
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1508061253366-f7da158b6d4f?w=300&auto=format&fit=crop&q=80"
              alt="Dry Fruits"
              className="absolute right-[-10px] bottom-0 h-40 w-36 object-contain pointer-events-none mix-blend-multiply"
            />
          </div>

          {/* Card 2: Luminous Power Solutions */}
          <div className="bg-[#e4eff9] text-gray-950 p-5 rounded shadow-sm border border-blue-150 flex justify-between items-center relative overflow-hidden h-44 hover:shadow-product transition-shadow">
            <div className="flex flex-col justify-between h-full z-10 max-w-[60%]">
              <div>
                <span className="text-blue-600 text-[10px] font-black tracking-wider uppercase block">Luminous</span>
                <h4 className="text-base font-black leading-tight mt-2.5">Power solutions Up to 40% Off</h4>
                <p className="text-[10px] text-gray-650 mt-1">Be summer ready</p>
              </div>
              <div className="bg-white/80 border border-blue-200 rounded px-2 py-1 text-[9px] font-bold block w-max leading-tight mt-auto">
                <span className="text-[#004b87]">HDFC BANK</span> Flat 10% Discount
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1558441719-ff34b0524a24?w=300&auto=format&fit=crop&q=80"
              alt="Power Solutions"
              className="absolute right-0 bottom-0 h-32 w-32 object-contain pointer-events-none mix-blend-multiply"
            />
          </div>

          {/* Card 3: Mivi Audio */}
          <div className="bg-[#1f1e24] text-white p-5 rounded shadow-sm border border-zinc-800 flex justify-between items-center relative overflow-hidden h-44 hover:shadow-product transition-shadow">
            <div className="flex flex-col justify-between h-full z-10 max-w-[60%]">
              <div>
                <span className="text-green-500 text-[10px] font-black tracking-wider uppercase block">MIVI</span>
                <h4 className="text-base font-black leading-tight mt-2.5">Loud & hot deals Up to 83% Off</h4>
                <p className="text-[10px] text-zinc-400 mt-1">Limited time offer</p>
              </div>
              <div className="bg-zinc-800/80 border border-zinc-700 rounded px-2 py-1 text-[9px] font-bold block w-max leading-tight mt-auto">
                <span className="text-blue-400">SBI Card</span> 10% instant discount
              </div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1545454675-3531b543be5d?w=300&auto=format&fit=crop&q=80"
              alt="Speakers"
              className="absolute right-[-10px] bottom-0 h-36 w-32 object-contain pointer-events-none"
            />
          </div>

        </div>

        {/* USER RECENTLY VIEWED SHELF (Matches the look of "Ritesh, still looking for these?") */}
        {recentlyViewed.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded border border-gray-150 dark:border-zinc-800 p-4 md:p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between border-b pb-3.5 mb-4">
              <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
                {user ? `${user.name.split(' ')[0]}, still looking for these?` : 'Still looking for these?'}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentlyViewed.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Best Deals */}
        <div className="bg-white dark:bg-zinc-900 rounded border border-gray-150 dark:border-zinc-800 p-4 md:p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b pb-3.5 mb-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-flipkart-orange animate-pulse" />
              <h3 className="text-base font-extrabold text-gray-850 dark:text-white">Best Deals of the Day</h3>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.length > 0 ? (
                featured.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-gray-500">No products found.</div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Trending Products */}
        <div className="bg-white dark:bg-zinc-900 rounded border border-gray-150 dark:border-zinc-800 p-4 md:p-5 shadow-sm transition-colors">
          <div className="flex items-center justify-between border-b pb-3.5 mb-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-base font-extrabold text-gray-850 dark:text-white">Trending on Flipkart</h3>
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.length > 0 ? (
                trending.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-gray-500">No products found.</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Home;
