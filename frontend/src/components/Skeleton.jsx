import React from 'react';

export const ProductSkeleton = () => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-sm p-4 flex flex-col gap-3 animate-skeleton h-full">
      <div className="w-full h-40 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      <div className="w-1/3 h-3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      <div className="w-3/4 h-4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      <div className="w-1/2 h-3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      <div className="flex gap-2 items-center mt-auto">
        <div className="w-16 h-5 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        <div className="w-10 h-3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={idx} />
      ))}
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 animate-skeleton">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Images */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="w-full h-96 bg-gray-200 dark:bg-zinc-800 rounded-sm"></div>
          <div className="flex gap-2">
            <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-sm"></div>
            <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-sm"></div>
            <div className="w-20 h-20 bg-gray-200 dark:bg-zinc-800 rounded-sm"></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="h-12 bg-gray-200 dark:bg-zinc-800 rounded-sm"></div>
            <div className="h-12 bg-gray-200 dark:bg-zinc-800 rounded-sm"></div>
          </div>
        </div>

        {/* Right Side: details */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-1/4 h-3 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-3/4 h-7 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-1/6 h-5 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          <div className="flex gap-2 items-center">
            <div className="w-20 h-6 bg-gray-200 dark:bg-zinc-800 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          </div>
          <div className="w-full h-24 bg-gray-200 dark:bg-zinc-800 rounded"></div>
          <div className="w-full h-40 bg-gray-200 dark:bg-zinc-800 rounded"></div>
        </div>

      </div>
    </div>
  );
};
