'use client'
import React, { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

const FloatingCartButton = () => {
    const { router, cartItems, products } = useAppContext();
    const [totalQty, setTotalQty] = useState(0);

    // Dynamic calculator loop updates item quantity bubbles in real-time
    useEffect(() => {
        if (!cartItems) {
            setTotalQty(0);
            return;
        }
        
        let count = 0;
        // Handles multiple cart tracking data shapes (objects or batch item indices)
        if (typeof cartItems === 'object') {
            Object.values(cartItems).forEach(qty => {
                if (typeof qty === 'number') count += qty;
            });
        }
        setTotalQty(count);
    }, [cartItems]);

    // Render nothing if the basket selection contains zero active units
    if (totalQty <= 0) return null;

    return (
        <div 
            onClick={() => {
                router.push('/cart');
                if (typeof window !== "undefined") window.scrollTo(0, 0);
            }}
            className="fixed right-5 top-1/2 -translate-y-1/2 z-50 group cursor-pointer flex flex-col items-center justify-center bg-white hover:bg-gray-200 active:bg-yellow-500 text-gray-900 w-14 h-14 rounded-full shadow-lg border border-orange-500/20 hover:scale-110 active:scale-95 transition-all duration-200 select-none" 
           // className="fixed right-5 top-1/2 -translate-y-1/2 z-50 group cursor-pointer flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white w-14 h-14 rounded-full shadow-lg border border-orange-500/20 hover:scale-110 active:scale-95 transition-all duration-200 select-none"
            title="Checkout"
        >
            {/* Circular Frame Housing the Checkout Asset Icon Layout */}
            <div className="w-6 h-6 flex items-center justify-center">
                <img 
                    src={typeof assets.checkout_icon === 'object' ? assets.checkout_icon.src : (assets.checkout_icon || "/checkout-icon.png")} 
                    alt="Floating Checkout Icon" 
                    className="w-full h-full object-contain brightness-100 invert group-hover:rotate-12 transition-transform duration-200" 
                />
            </div>
            
        </div>
    );
};

export default FloatingCartButton;
