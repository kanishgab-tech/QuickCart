"use client"
import React from "react";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, router } = useAppContext();

  // 1. Filter products where isPopular is explicitly true
  let featuredProducts = products ? products.filter(product => product.isPopular === true) : [];

  // 2. Safe Fallback: If no popular items are picked yet, fallback to show the 15 newest products
  if (featuredProducts.length === 0 && products && products.length > 0) {
    featuredProducts = products.slice(0, 15);
  } else {
    // Cap at a maximum of 15 items even if the seller checked more by mistake
    featuredProducts = featuredProducts.slice(0, 15);
  }

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full">Popular products</p>
      
      {/* Product Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
        {featuredProducts.map((product, index) => (
          <ProductCard key={product._id || index} product={product} />
        ))}
      </div>
      
      {/* Redirect Button to Shop Page */}
      <button 
        onClick={() => { router.push('/all-products') }} 
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition cursor-pointer font-medium text-sm"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
