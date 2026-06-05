import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Shirt, Smartphone, Sparkles, Laptop, Home as HomeIcon, Tv, Gamepad2, Apple, Car, Bike, Trophy, BookOpen, Armchair } from 'lucide-react';

const CategoryBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract category query from URL to show active status
  const params = new URLSearchParams(location.search);
  const activeCategory = params.get('category') || '';

  const categories = [
    { name: 'For You', slug: '', icon: ShoppingBag },
    { name: 'Fashion', slug: 'fashion', icon: Shirt },
    { name: 'Mobiles', slug: 'mobiles', icon: Smartphone },
    { name: 'Beauty', slug: 'beauty', icon: Sparkles },
    { name: 'Electronics', slug: 'electronics', icon: Laptop },
    { name: 'Home', slug: 'home', icon: HomeIcon },
    { name: 'Appliances', slug: 'appliances', icon: Tv },
    { name: 'Toys', slug: 'toys', icon: Gamepad2 },
    { name: 'Food & Health', slug: 'food-health', icon: Apple },
    { name: 'Auto Acc', slug: 'auto-accessories', icon: Car },
    { name: '2 Wheelers', slug: 'two-wheelers', icon: Bike },
    { name: 'Sports', slug: 'sports', icon: Trophy },
    { name: 'Books', slug: 'books', icon: BookOpen },
    { name: 'Furniture', slug: 'furniture', icon: Armchair },
  ];

  const handleCategoryClick = (slug) => {
    if (slug) {
      navigate(`/search?category=${slug}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-gray-250 dark:border-zinc-800 py-3 overflow-x-auto scrollbar-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center gap-6 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.slug;
          
          return (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.slug)}
              className="flex flex-col items-center gap-2 group cursor-pointer relative pb-1 min-w-[70px]"
            >
              <div className={`
                p-2 rounded-xl transition-all duration-200 flex items-center justify-center
                ${isActive 
                  ? 'bg-blue-50 dark:bg-blue-950/20 text-flipkart-blue dark:text-blue-400 scale-105 border border-blue-100 dark:border-blue-900' 
                  : 'bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 group-hover:scale-105 group-hover:text-flipkart-blue'}
              `}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              
              <span className={`
                text-[11px] font-bold tracking-tight transition-colors
                ${isActive 
                  ? 'text-flipkart-blue dark:text-blue-400 font-extrabold' 
                  : 'text-gray-650 dark:text-zinc-300 group-hover:text-flipkart-blue'}
              `}>
                {cat.name}
              </span>

              {/* Underline indicator matching screen style */}
              {isActive && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-flipkart-blue dark:bg-blue-400 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar;
