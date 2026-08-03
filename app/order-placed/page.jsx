'use client'
import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderPlaced = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // ✅ EXTRACT THE ORDER NUMBER DYNAMICALLY
    const orderNumber = searchParams.get('orderNumber');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <Navbar />
            
            <main className="flex-grow flex items-center justify-center px-6 py-16">
                <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-2xl shadow-sm text-center space-y-6">
                    
                    {/* Animated Check Success Badge Indicator */}
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Thank You For Your Order!</h1>
                        <p className="text-sm text-gray-500">Your transaction has been processed securely and your items are being prepared for shipping.</p>
                    </div>

                    {/* ✅ DISPLAY THE FORMATTED ORDER TRACKING BOX CONTAINER */}
                    {orderNumber ? (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Order Number</span>
                            <span className="text-lg font-mono font-black text-orange-600 tracking-wide select-all">
                                {orderNumber}
                            </span>
                            <p className="text-[10px] text-gray-400 pt-1">Tip: Double-click to highlight and copy this tracking token.</p>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs">
                            Processing order details. Refreshing this window shortly...
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => router.push('/all-products')}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:bg-gray-50 transition cursor-pointer text-center"
                        >
                            Continue Shopping
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/track-order')}
                            className="flex-1 py-3 bg-orange-600 text-white font-semibold text-xs rounded-xl hover:bg-orange-700 transition shadow-sm hover:shadow cursor-pointer text-center"
                        >
                            Track Package
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderPlaced;
