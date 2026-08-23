    'use client'
    import React, { useState, useEffect } from "react";
    import Navbar from "@/components/Navbar";
    import Footer from "@/components/Footer";
    import Titlebar from "@/components/Titlebar";
    import { useAppContext } from "@/context/AppContext";
    import { useUser } from "@clerk/nextjs";
    import ProductPreviewBlock from "@/components/ProductPreviewBlock";

    const QuickShop = () => {
        const { products, setCartItems, cartItems, showToast,router} = useAppContext();

        // Store row quantities in an object: { [productId]: quantity }
        const [quantities, setQuantities] = useState({});
        const [isSubmitting, setIsSubmitting] = useState(false);
       
        const [activePreviewProduct, setActivePreviewProduct] = useState(null);
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


    // Handle input change safely with a max limit of 999
    const handleQuantityChange = (productId, val) => {
        // Allow the user to temporarily clear the input field to type a new number
        if (val === "") {
            setQuantities(prev => ({ ...prev, [productId]: "" }));
            return;
        }

        let parsedVal = parseInt(val, 10);
        
        // Notify user and cap input value if it exceeds 999
        if (parsedVal > 999) {
            showToast("Maximum quantity allowed per item is 999.", "error");
            parsedVal = 999;
        }

        // Ensure values remain non-negative integers
        const finalVal = isNaN(parsedVal) || parsedVal < 0 ? 0 : parsedVal;
        
        setQuantities(prev => ({
            ...prev,
            [productId]: finalVal
        }));
    };

      // Increment controller button action with validation check
    const incrementQty = (productId) => {
        const currentQty = quantities[productId] || 0;
        
        if (currentQty >= 999) {
            showToast("Maximum quantity allowed per item is 999.", "error");
            return;
        }

        setQuantities(prev => ({
            ...prev,
            [productId]: currentQty + 1
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
                return acc + (product.offerPrice * qty);
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
                    <div className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 pt-4 border-b border-gray-200 transition-all duration-200">
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
                                        const rowSubtotal = (product.offerPrice || 0) * qty;

                                        return (
                                            <tr key={id} className="hover:bg-gray-50/50 transition-colors">
                                                                                                {/* Image cell - Upgraded to roll open the Product Details Workspace Modal */}
                                                <td className="py-4 px-6">
                                                    <div 
                                                        onClick={() => setActivePreviewProduct(product)}
                                                        className="w-16 h-16 rounded-xl border border-gray-200 bg-white overflow-hidden relative shrink-0 cursor-zoom-in group shadow-2xs active:scale-95 transition-all select-none"
                                                        title={`Click to view full interactive specifications for ${product.name}`}
                                                    >
                                                        <img 
                                                            src={Array.isArray(product.image) ? product.image[0] : (product.image || '')} 
                                                            alt={product.name || 'Product'}
                                                            className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-200"
                                                        />
                                                        
                                                        {/* Hover overlay hint indicator overlay mask */}
                                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-gray-700 bg-white/20 backdrop-blur-[0.5px]">
                                                            👁️ Info
                                                        </div>
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

                                                {/* Unit price dynamic block rendering - Highlights discount difference */}
                                                <td className="py-4 px-4 text-right font-medium">
                                                    {/* Changed to flex-row, items-baseline to align text bottoms, and justify-end to keep right-alignment */}
                                                    <div className="flex flex-row items-baseline justify-end gap-1.5">
                                                        {/* Prominent Current Offer Price */}
                                                        <span className="text-gray-950 font-bold text-sm">
                                                            ₹{(product.offerPrice || 0).toLocaleString('en-IN')}
                                                        </span>
                                                        
                                                        {/* Strikethrough Original Base Price */}
                                                        {product.price > product.offerPrice && (
                                                            <span className="text-gray-400 line-through text-[11px] font-semibold tracking-wide">
                                                                ₹{(product.price || 0).toLocaleString('en-IN')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>


                                                {/* Quantity Field with Modifier Controls */}
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-center border border-gray-300 rounded-md w-36 mx-auto overflow-hidden bg-white">
                                                        <button type="button" onClick={() => decrementQty(id)}
                                                            className="w-10 h-9 font-semibold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-300 flex items-center justify-center cursor-pointer select-none">
                                                            &minus;
                                                        </button>
                                                        <input 
                                                            type="number"  min="0" max = "999" value={qty === 0 ? "" : qty}
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
                        {/* FIXED: Changed ProductPreviewBlock condition to check your local activePreviewProduct state instead */}
            {activePreviewProduct && (
                <div 
                    onClick={() => setActivePreviewProduct(null)} // Click outside onto dark blur to exit instantly
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-10 animate-fade-in"
                >
                    {/* The Inner Modal Content Board Box */}
                    <div 
                        onClick={(e) => e.stopPropagation()} // Stop propagation prevents closing panel if clicking content inside
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-gray-100 relative animate-scale-up"
                    >
                        {/* Modal Header Controls flex bar row */}
                        <div className="p-4 bg-orange-500 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
                            <div>
                                <h3 className="text-sm font-black text-white  tracking-wider flex items-center gap-1.5">
                                    Product Preview
                                </h3>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setActivePreviewProduct(null)}
                                className="w-8 h-8 rounded-full bg-gray-200/60 text-gray-500 font-bold flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer select-none text-lg"
                                title="Close Preview Window"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body: Renders your full detailed product view page layout */}
                        <div className="p-6 overflow-y-auto flex-grow bg-white">
                            {/* Reusing your verified details view, passing hideCheckoutButtons=true safely */}
                            <ProductPreviewBlock 
                                productData={activePreviewProduct} 
                                hideCheckoutButtons={true} 
                            />
                        </div>

                        {/* Modal Action Footer flex row bar */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <span className="text-[12px] text-gray-400 font-normal hidden sm:inline mr-auto">
                                💡 Click anywhere outside this white card container window frame to slide back down
                            </span>
                            <button
                                type="button"
                                onClick={() => setActivePreviewProduct(null)}
                                className="px-4 py-2 bg-orange-500 hover:bg-orange-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                            >
                                Close Preview
                            </button>
                        </div>

                    </div>
                </div>
            )}


        </div>
    );
    }
    export default QuickShop;

                            
                            
                                                        