'use client'
import React, { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import ProductCard from "@/components/ProductCard";
import { useAppContext } from "@/context/AppContext";

const WishlistGridContent = () => {
    const { wishlist, products } = useAppContext();

    // FIXED: Because context 'wishlist' may contain full objects or raw string IDs, 
   // Filters down your active global product catalog based on local session IDs instantly
    const favoritedProducts = products ? products.filter(product => {
        const pId = product._id || product.id;
        return wishlist.includes(pId);
    }) : [];

    return (
        <div className="w-full">
            {favoritedProducts.length === 0 ? (
                /* Empty Wishlist Grid Screen Layout Placeholder */
                <div className="text-center py-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs max-w-xl mx-auto mt-6">
                    <span className="text-4xl block mb-3 animate-pulse">❤️</span>
                    <h3 className="text-base font-bold text-gray-900">Your Wishlist is Empty</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        Tap the heart button overlay icon sitting on any product card while browsing our store catalog to pin your favorites right here.
                    </p>
                </div>
            ) : (
                /* Active Favorited Storefront Grid */
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center w-full mt-6">
                    {favoritedProducts.map((product) => (
                        <ProductCard key={product._id || product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

// MAIN EXPORT WRAPPED IN SUSPENSE FOR NEXT.JS BUILD ROBUSTNESS
const MyWishlistPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 text-gray-700">
            <Navbar />
            <Titlebar />

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-16 lg:px-32 py-10 flex flex-col items-start">
                {/* Heading Area Banner */}
                <div className="flex flex-col items-start border-b border-gray-200/60 w-full pb-4">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                        <span>❤️</span> Your Wishlist
                    </h2>
                    <div className="w-12 h-0.5 bg-orange-600 rounded-full mt-1.5"></div>
                </div>

                <Suspense fallback={
                    <div className="w-full text-center py-20 text-xs font-semibold text-gray-400 animate-pulse">
                        Synchronizing favorited catalog items...
                    </div>
                }>
                    <WishlistGridContent />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
};

export default MyWishlistPage;
