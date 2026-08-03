'use client'
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import { useAppContext } from "@/context/AppContext";
import { useUser } from "@clerk/nextjs";


const QuickShop = () => {
    const { products, setCartItems, cartItems, showToast} = useAppContext();

     // Store row quantities in an object: { [productId]: quantity }
    const [quantities, setQuantities] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = useUser(); 
    const userId = user?.id;
   
    // Initialize quantities to 0 for all products when loaded
    useEffect(() => {
        if (products && products.length > 0) {
            const initialQuantities = {};
            products.forEach(product => {
                const id = product.id || product._id;
                initialQuantities[id] = 0;
            });
            setQuantities(initialQuantities);
        }
    }, [products]);

    // Handle input change safely
    const handleQuantityChange = (productId, val) => {
        const parsedVal = parseInt(val, 10);
        // Ensure values remain non-negative integers
        const finalVal = isNaN(parsedVal) || parsedVal < 0 ? 0 : parsedVal;
        
        setQuantities(prev => ({
            ...prev,
            [productId]: finalVal
        }));
    };

    // Increment controller button action
    const incrementQty = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    // Decrement controller button action
    const decrementQty = (productId) => {
        setQuantities(prev => ({
            ...prev,
            [productId]: Math.max((prev[productId] || 0) - 1, 0)
        }));
    };

    // Calculate total order amount across all items
    const calculateTotalAmount = () => {
        return products ? products.reduce((acc, product) => {
            const id = product.id || product._id;
            const qty = quantities[id] || 0;
            return acc + (product.price * qty);
        }, 0) : 0;
    };

    
    // Process submission and merge selected counts into global cart state
    const handleAddToBag = async (e) => {
        e.preventDefault();
        
        // Filter out products that have an active order quantity greater than 0
        const itemsToUpdate = Object.entries(quantities).filter(([_, qty]) => qty > 0);

        if (itemsToUpdate.length === 0) {
            showToast("Please enter a quantity for at least one item before adding to cart.", "error");
            return;
        }

        // Prevent double submission if click spamming occurs
         if (isSubmitting) return; 
            setIsSubmitting(true);

         // 1. Create the new merged cart state array/object locally first
        const updatedCart = { ...cartItems };
        itemsToUpdate.forEach(([id, qty]) => {
            if (updatedCart[id]) {
                updatedCart[id] += qty; // Increment quantity if item exists
            } else {
                updatedCart[id] = qty;  // Set initial quantity if new to cart
            }
        });
        try {
            if (userId) {
                // A. LOGGED IN USER: Synchronize with the backend database
                const response = await fetch('/api/cart/update', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: userId, 
                        cartData: updatedCart 
                    }),
                });

                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || "Server sync failed");
                    }
            }
            else {
            // B. GUEST USER: Persist cart to browser localStorage immediately
            localStorage.setItem("guest_cart", JSON.stringify(updatedCart));
            }

            // --- SUCCESS RESOLUTION HANDLER (Runs for both Guest & User) ---
            setCartItems(updatedCart);
            
            // Reset quantities form back to zero
            const resetQuantities = {};
            products.forEach(product => {
                resetQuantities[product.id || product._id] = 0;
            });
            setQuantities(resetQuantities);
            
            showToast("Items successfully added to your shopping cart!", "success");

        } catch (error) {
            console.error("Cart synchronization error:", error);
            showToast(error.message || "A network error occurred while updating your cart.", "error");
        }
        finally {
        // 3. TURN LOADING STATE OFF (runs on both success or catch errors)
        setIsSubmitting(false);
    }
    };

    return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
        <Navbar />
        <Titlebar />

        {/* Wrap everything inside the form so that the button and total work correctly */}
        <form onSubmit={handleAddToBag} className="flex-grow px-6 md:px-16 lg:px-32 py-12 space-y-8">
            <main>
                {/* Header & Actions Section (Top Side Alignment) */}
                 <div className="sticky top-0 z-50 bg-gray-50/90 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 pt-4 border-b border-gray-200 transition-all duration-200">
                    <div className="flex flex-col items-start">
                        <h1 className="text-3xl font-bold tracking-tight">Quick Shop</h1>
                        <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-2"></div>
                        <p className="text-gray-500 mt-2 text-sm">Enter quantities next to items and append selections to your cart simultaneously.</p>
                    </div>
                    
                    {/* Top-Right Side Action Panel */}
                    <div className="flex items-center gap-6 bg-white border border-gray-200 p-4 rounded-xl shadow-sm self-start md:self-auto min-w-[280px] md:min-w-0 justify-between md:justify-start">
                        <div className="text-left">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Grand Total</span>
                            <span className="text-xl font-black text-gray-900">
                                ₹{(calculateTotalAmount() || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                           <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs px-5 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-150 text-center whitespace-nowrap min-w-[110px] ${
                                isSubmitting ? 'opacity-75 cursor-not-allowed bg-orange-700' : 'cursor-pointer'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    {/* SVG Spinner Graphic */}
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                "Add to Cart"
                            )}
                        </button>
                    </div>
                </div>

                {/* Responsive Grid Table Display Viewport */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto mt-8">
                    <table className="w-full min-w-[750px] text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100/70 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider">
                                <th className="py-4 px-6 w-24">Product</th>
                                <th className="py-4 px-4">Details</th>
                                <th className="py-4 px-4 text-left w-32">Category</th>
                                <th className="py-4 px-4 text-right w-32">Unit Price</th>
                                <th className="py-4 px-4 text-center w-44">Quantity</th>
                                <th className="py-4 px-6 text-right w-36">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {products && products.length > 0 ? (
                                products.map((product) => {
                                    const id = product.id || product._id;
                                    const qty = quantities?.[id] || 0;
                                    const rowSubtotal = (product.price || 0) * qty;

                                    return (
                                        <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Image cell */}
                                            <td className="py-4 px-6">
                                                <div className="w-16 h-16 rounded border border-gray-100 bg-white overflow-hidden relative shrink-0">
                                                    <img 
                                                        src={Array.isArray(product.image) ? product.image[0] : (product.image || '')} 
                                                        alt={product.name || 'Product'}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            </td>
                                            {/* Details text cells */}
                                            <td className="py-4 px-4 max-w-xs">
                                                <p className="font-semibold text-gray-900 truncate">{product.name || 'Unnamed Item'}</p>
                                                <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {product.description || "No description provided."}
                                                </p>
                                            </td>
                                            {/* Category cell - Added safety fallback if category is an object */}
                                            <td className="py-4 px-4 text-left text-gray-600">
                                                {typeof product.category === 'object' ? product.category?.name : (product.category || "Uncategorized")}  
                                            </td>

                                            {/* Unit price dynamic block rendering */}
                                            <td className="py-4 px-4 text-right font-medium text-gray-600">
                                                ₹{(product.price || 0).toLocaleString('en-IN')}
                                            </td>
                                            {/* Quantity Field with Modifier Controls */}
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-center border border-gray-300 rounded-md w-36 mx-auto overflow-hidden bg-white">
                                                    <button type="button" onClick={() => decrementQty(id)}
                                                        className="w-10 h-9 font-semibold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-300 flex items-center justify-center cursor-pointer select-none">
                                                        &minus;
                                                    </button>
                                                    <input 
                                                        type="number"  min="0"  value={qty === 0 ? "" : qty}
                                                        onChange={(e) => handleQuantityChange(id, e.target.value)}
                                                        placeholder="0"
                                                        className="w-16 text-center text-sm font-semibold focus:outline-none bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"/>
                                                    <button  type="button"  onClick={() => incrementQty(id)}
                                                        className="w-10 h-9 font-semibold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors border-l border-gray-300 flex items-center justify-center cursor-pointer select-none">
                                                        +
                                                    </button>   
                                                </div>
                                            </td>
                                            {/* Subtotal Calculation Cell */}
                                            <td className="py-4 px-6 text-right font-semibold text-gray-900">
                                                ₹{rowSubtotal.toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-400">
                                        No products available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
            
        </form>
        <Footer />
         
    </div>
);
}
export default QuickShop;

                          
                           
                                                    