'use client'
import React, { Suspense } from 'react'; // ✅ Import Suspense
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import Image from 'next/image'

// 1. UPDATED COMPONENT WITH SECURE BILLING INFO MATRIX
const OrderSuccessContent = () => {

    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Injected user variable from your global application context mapping loop
    const { user, showToast, currency} = useAppContext(); 
    
    const orderNumber = searchParams.get('orderNumber');
    const orderAmount = searchParams.get('amount') || "0";

    // Segmented click listener loop based on user authentication status
    const handleTrackOrderClick = () => {
        if (user) {
            router.push('/my-orders');
        } else {
            // Safe cross-browser fallback alert in case toast layout wrappers are missing on this screen
            if (typeof showToast === "function") {
                showToast("Guest Order! Please check your email inbox folder for processing receipt tracking codes.", "success");
            } else {
                alert("Guest Order Confirmation!\nPlease check your email inbox folder for processing receipt tracking codes.");
            }
        }
    };

    return (
        <div className="max-w-md w-full bg-white border border-gray-200 p-6 md:p-8 rounded-2xl shadow-sm text-center space-y-5 animate-fade-in my-6">
            
            {/* Animated Check Success Badge Indicator */}
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <div className="space-y-1.5">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Thank You For Your Order!</h1>
                <p className="text-xs text-gray-500 font-medium px-2 leading-relaxed">
                    Your order request has been logged successfully. Kindly process the payment transfer of <b className="text-gray-900 text-sm font-black decoration-orange-500 decoration-2 underline-offset-2">{currency} {Number(orderAmount).toLocaleString('en-IN')}</b> referencing your order token identifier below.
                </p>
            </div>

            {/* Display Order Number Block */}
            {orderNumber ? (
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Your Order Number</span>
                    <span className="text-base font-mono font-black text-orange-600 tracking-wide select-all">
                        {orderNumber}
                    </span>
                    <p className="text-[9px] text-gray-400 pt-0.5">Tip: Double-click to highlight and copy this reference token.</p>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold">
                    Loading order placement confirmation token string...
                </div>
            )}

            {/* NEW ADDITION: ENHANCED INTERACTIVE BANK & PAYMENT RECEPTACLE LAYOUT BOX */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                    <span className="text-base">🏦</span>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Official Payment Credentials</h4>
                </div>

                {/* Structured Text Metadata Records Grid */}
                <div className="space-y-2 text-xs font-medium text-gray-600">
                    <div className="flex justify-between items-center bg-white border border-gray-200/60 p-2 rounded-lg">
                        <span className="text-gray-400 font-semibold text-[10px] ">Account Holder</span>
                        <span className="text-gray-900 font-bold tracking-wide">KANSAN PVT LTD</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border border-gray-200/60 p-2 rounded-lg">
                        <span className="text-gray-400 font-semibold text-[10px] ">Account Number</span>
                        <span className="text-gray-900 font-mono font-bold select-all tracking-wider">924020054781632</span>
                    </div>

                    <div className="flex justify-between items-center bg-white border border-gray-200/60 p-2 rounded-lg">
                        <span className="text-gray-400 font-semibold text-[10px] ">Bank IFSC Code</span>
                        <span className="text-gray-900 font-mono font-bold select-all uppercase tracking-wide">UTIB0000290</span>
                    </div>
                </div>

                {/* QR Scanner Module Wrapper Area */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col text-center sm:text-left gap-1">
                        <span className="text-[11px] font-extrabold text-gray-900 flex items-center justify-center sm:justify-start gap-1">
                            <span>📲</span> UPI / BHIM / GPay Scan
                        </span>
                        <p className="text-[10px] text-gray-400 leading-normal max-w-[180px]">
                            Open any payment application on your smartphone, scan the code layout, and input your grand checkout amount.
                        </p>
                    </div>
                  
                </div>
                {/* The Scan Vector Frame */}
                    <div className="w-48 h-48 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0 group shadow-2xs p-1">
                        {assets.upi_img ? (
                            <Image 
                                src={assets.upi_img} 
                                alt="UPI QR Scanner" 
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" 
                                width={96} 
                                height={96} 
                                priority
                            /> 
                        ) : (
                            /* Fallback CSS Placeholder graphic if asset object string is missing */
                            <div className="absolute inset-2 border-2 border-dashed border-orange-500/40 rounded flex flex-col items-center justify-center text-gray-400 bg-white group-hover:border-orange-500 transition-colors">
                                <span className="text-[18px]">🏁</span>
                                <span className="text-[8px] font-black text-gray-400 mt-1 uppercase tracking-tighter">QR Scanner</span>
                            </div>
                        )}
                    </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-[10px] text-amber-800 font-medium leading-normal">
                    <span className="text-xs leading-none mt-0.5">💡</span>
                    <p>Important: Once your bank transfer finishes processing, make a screenshot of the confirmation page receipt and upload it inside your support dashboard panel.</p>
                </div>
            </div>

            {/* Secondary notice banner displayed explicitly to Guest Users */}
            {!user && (
                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-blue-800 font-medium text-left animate-fade-in">
                    <span className="text-sm leading-none mt-0.5">📧</span>
                    <div>
                        <p className="font-bold">Guest Order Confirmation Notice</p>
                        <p className="text-blue-700/90 mt-0.5">An invoice receipt containing delivery guidelines and tracking links has been streamed to your guest contact inbox line.</p>
                    </div>
                </div>
            )}

            {/* Layout Action Form Controls Grid Row */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                    type="button"
                    onClick={() => router.push('/all-products')}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold text-xs rounded-xl hover:bg-gray-50 transition-all cursor-pointer text-center select-none active:scale-[0.99]"
                >
                    Continue Shopping
                </button>
                <button
                    type="button"
                    onClick={handleTrackOrderClick}
                    className="flex-1 py-3 bg-orange-600 text-white font-semibold text-xs rounded-xl hover:bg-orange-700 transition-all shadow-xs hover:shadow-2xs cursor-pointer text-center select-none active:scale-[0.99]"
                >
                    {user ? "Track package" : "Tracking info"}
                </button>
            </div>
        </div>
    );
};


// 2. MAIN EXPORT PAGE: WRAPS CARDS IN SUSPENSE SO NEXT BUILD SUCCEEDS
// 2. MAIN EXPORT PAGE: Upgraded to render custom toast layout elements
const OrderPlaced = () => {
    // Destructure your dynamic notification stack out of context hooks
    const { toasts } = useAppContext();

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800 relative">
            <Navbar />
            
            <main className="flex-grow flex items-center justify-center px-6 py-16">
                <Suspense fallback={
                    <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-2xl shadow-sm text-center">
                        <p className="text-sm text-gray-400">Loading order configuration parameters...</p>
                    </div>
                }>
                    <OrderSuccessContent />
                </Suspense>
            </main>

            {/* FIXED: Injected the live notifications layout loop stack right here */}
            {toasts && toasts.length > 0 && (
                <div className="fixed bottom-5 right-5 space-y-2 z-50 animate-fade-in max-w-sm">
                    {toasts.map((t) => (
                        <div 
                            key={t.id} 
                            className={`p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 text-white bg-gray-900 border-gray-800`}
                        >
                            <span>🔔</span> {t.message}
                        </div>
                    ))}
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OrderPlaced;

