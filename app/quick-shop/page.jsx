    'use client'
    import React, { useState, useEffect } from "react";
    import Navbar from "@/components/Navbar";
    import Footer from "@/components/Footer";
    import Titlebar from "@/components/Titlebar";
    import { useAppContext } from "@/context/AppContext";
    import { assets } from "@/assets/assets";
    import { useUser } from "@clerk/nextjs";
    import ProductPreviewBlock from "@/components/ProductPreviewBlock";
    import FloatingCartButton from "@/components/FloatingCartButton";

    const QuickShop = () => {
        const { products, setCartItems, cartItems, showToast,subtotal,router} = useAppContext();

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
        const SubTotalAmount = () => {
            return products ? products.reduce((acc, product) => {
                const id = product.id || product._id;
                const qty = quantities[id] || 0;
                return (acc + (product.offerPrice * qty));
            }, 0) : 0;
        };

        const calculateTotalAmount = () => {
            return subtotal;
        }
        
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
        // 1. FIXED DATA PROCESSING: Group products by category and sort them alphabetically
        const groupedProducts = {};

        if (products && products.length > 0) {
            // Group products into their respective category baskets
            products.forEach((product) => {
                const categoryName = typeof product.category === 'object' 
                    ? product.category?.name 
                    : (product.category || "Uncategorized");
                    
                if (!groupedProducts[categoryName]) {
                    groupedProducts[categoryName] = [];
                }
                groupedProducts[categoryName].push(product);
            });

            // Alphabetically sort products by name within each category basket
            Object.keys(groupedProducts).forEach((category) => {
                groupedProducts[category].sort((a, b) => {
                    const nameA = (a.name || "").toLowerCase();
                    const nameB = (b.name || "").toLowerCase();
                    return nameA.localeCompare(nameB);
                });
            });
        }

        // Extract sorted list of unique category names for sequential rendering loops
        const sortedCategories = Object.keys(groupedProducts).sort((a, b) => a.localeCompare(b));


        return (
        <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
            <Navbar />
            <Titlebar />

            {/* Wrap everything inside the form so that the button and total work correctly */}
            <form onSubmit={handleAddToBag} className="flex-grow px-6 md:px-16 lg:px-32 py-12 space-y-8">
                <main>
                    {/* Header & Actions Section (Top Side Alignment) */}
                    <div className="sticky top-0 z-40 bg-gray-50/90 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 pt-4 border-b border-gray-200 transition-all duration-200">
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

                            {/* ACTION 2: Fixed Async Guarded Checkout Button 
                            <button 
                                type="button" 
                                disabled={isSubmitting}
                                onClick={async (e) => {router.push('/cart');
                                }}
                                className={`flex items-center justify-center gap-1.5 bg-white-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs px-5 py-3 rounded-lg shadow-sm hover:shadow transition-all duration-150 text-center whitespace-nowrap ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed bg-orange-700' : 'cursor-pointer'
                                }`}
                            >
                                {isSubmitting ? (
                                <span className="animate-pulse">Processing...</span>
                                ) : (
                                <span>Checkout 💳</span>
                                )}
                            </button>*/}

                        </div>
                    </div>

                {/* Responsive Grid Table Display Viewport */}
                 <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto mt-8 
            /* Webkit mobile swipe acceleration touch parameters configuration handles scrolling beautifully */
            -webkit-overflow-scrolling: touch;">
                    <table className="w-full min-w-full md:min-w-[850px] text-left border-collapse table-fixed">
                    {/* FIXED: Introduced table-fixed layout strategy with exact, well-balanced master column column definitions */}
                    <colgroup>
                    <col className="w-24"/>  {/* Product Graphic Thumbnail */}
                    <col className="hidden md:table-column w-24"/>  {/* Item Code Badge Pin */}
                    <col className="w-52"/> {/* Dynamic Details Text (Absorbs the remaining main layout row space) */}
                    <col className="hidden md:table-column w-32"/>  {/* Brand Labels */}
                    <col className="w-24"/>  {/* Unit Price Metrics */}
                    <col className="w-44"/>  {/* Quantity Numeric Stepper Controls */}
                    <col className="w-36"/>  {/* Row Amount */}
                    </colgroup>
                    <thead>
                    <tr className="bg-gray-200 border-b border-gray-200 text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        <th className="py-4 px-6">Product</th>
                        <th className="py-4 px-6 hidden md:table-cell">Code</th>
                        <th className="py-4 px-6">Details</th>
                        <th className="py-4 px-6 text-left hidden md:table-cell">Brand</th>
                        <th className="py-4 px-6 text-right">Price</th>
                        <th className="py-4 px-6 text-center">Quantity</th>
                        <th className="py-4 px-6 text-right">Amount</th>
                    </tr>
                       {/* DESKTOP EXCLUSIVE VIEWPORT ROW (Visible only on screens 768px and up) */}
                        <tr className="hidden md:table-row bg-amber-80 border-b border-gray-200 text-xs font-normal text-gray-700 tracking-wide whitespace-nowrap">
                            <th colSpan="6" className="py-3 px-6 text-right uppercase tracking-wider font-bold">
                            Subtotal:
                            </th>
                            <th className="py-3 px-6 text-right text-amber-700 font-extrabold text-sm">
                            ₹{(SubTotalAmount() || 0).toLocaleString('en-IN')}
                            </th>
                        </tr>

                        {/* MOBILE EXCLUSIVE VIEWPORT ROW (Visible only on small touch screen views) */}
                        <tr className="md:hidden bg-amber-50 border-b border-gray-200 text-xs font-normal text-gray-700 tracking-wide whitespace-nowrap">
                            <th colSpan="4" className="py-3 px-4 text-right uppercase tracking-wider font-bold">
                            Subtotal:
                            </th>
                            <th className="py-3 px-4 text-right text-amber-700 font-extrabold text-sm">
                            ₹{(SubTotalAmount() || 0).toLocaleString('en-IN')}
                            </th>
                        </tr>
                    </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
              {sortedCategories.length > 0 ? (
                sortedCategories.map((categoryName) => (
                  <React.Fragment key={categoryName}>
                    
                    {/* FIXED: Dynamic Category Subtitle Splitter Row Header */}
                    <tr className="bg-orange-50 border-y border-gray-200/60 select-none">
                      <td colSpan="7" className="py-.7 px-6 text-xs font-semibold text-orange-600 tracking-widest bg-orange-50/20">
                        <span className="text-gray-900 font-extrabold">{categoryName}</span> ({groupedProducts[categoryName].length} Items)
                      </td>
                    </tr>

                    {/* Render the sorted items belonging strictly to this single category bundle */}
                    {groupedProducts[categoryName].map((product) => {
                      const id = product.id || product._id;
                      const qty = quantities?.[id] || 0;
                      const rowSubtotal = (product.offerPrice || 0) * qty;
                      
                      return (
                        <tr key={id} className="border-b border-gray-400 bg-white hover:bg-gray-100/70 hover:shadow-2xs hover:scale-[1.002] transition-all duration-200 ease-in-out cursor-pointer">

                          {/* Image thumbnail cell */}
                          <td className="py-4 px-6 relative z-0 overflow-hidden">
                            <div 
                              onClick={() => setActivePreviewProduct(product)}
                              className="w-16 h-16 rounded-xl border border-gray-200 bg-white overflow-hidden relative shrink-0 cursor-zoom-in group shadow-2xs active:scale-95 transition-all select-none"
                              title={`Click to view full specifications for ${product.name}`}
                            >
                              <img 
                                src={Array.isArray(product.image) ? product.image[0] : (product.image || '')} 
                                alt={product.name || 'Product'} 
                                className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-200" 
                                onError={(e) => {
                                  e.target.onerror = null; 
                                  e.target.src = typeof assets?.box_icon === 'object' ? assets.box_icon.src : (assets?.box_icon || '');
                                }}
                              />
                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-gray-700 bg-white/20 backdrop-blur-[0.5px]">
                                👁️ Info
                              </div>
                            </div>
                          </td>

                           <td className="py-4 px-6 whitespace-nowrap hidden md:table-cell">
                            <span className="font-mono text-xs font-semibold text-gray-900 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded inline-block tracking-wide">
                              {product.productCode || "N/A"}
                            </span>
                          </td>

                          {/* Details Text Cell (Now concatenated inline with item identifier code tags) */}
                          <td className="py-4 px-4 pr-6">
                            <p className="font-semibold text-gray-900" title={product.name}>
                              {product.name || 'Unnamed Item'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                              {product.description || "No description provided."}
                            </p>
                          </td>
                        
                         <td className="py-4 px-4 text-left text-gray-600 font-medium whitespace-nowrap truncate hidden md:table-cell">
                            {product.brand || "NA"}
                          </td>

                        {/* Unit Price Metrics Cell - FIXED: Stacked original price vertically underneath the offer price */}
                                                    {/* Unit price dynamic block rendering - FIXED: Inlined a smart "Save %" badge */}
                          <td className="py-4 px-4 text-right font-medium whitespace-nowrap">
                            <div className="flex flex-col items-end gap-1 justify-center">
                              
                              {/* Row 1: Pricing Text Elements */}
                              <div className="flex flex-row items-baseline justify-end gap-1.5">
                                {/* Prominent Current Offer Price */}
                                <span className="text-gray-950 font-black text-sm">
                                  ₹{(product.offerPrice || 0).toLocaleString('en-IN')}
                                </span>
                                
                                {/* Strikethrough Original Base Price */}
                                {product.price > product.offerPrice && (
                                  <span className="text-gray-400 line-through text-[11px] font-semibold tracking-wide">
                                    ₹{(product.price || 0).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              {/* Row 2: Dynamic Discount Percentage Badge Token */}
                              {product.price > product.offerPrice && (
                                <span className="font-sans text-[9px] font-black text-green-700 bg-green-50 border border-green-200/60 px-1.5 py-0.5 rounded-md uppercase tracking-wider select-none animate-pulse">
                                  Save {Math.round(((product.price - product.offerPrice) / product.price) * 100)}%
                                </span>
                              )}

                            </div>
                          </td>

                          {/* Quantity Selector Stepper Element */}
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center border border-gray-300 rounded-md w-28 mx-auto overflow-hidden bg-white">
                              <button 
                                type="button" 
                                onClick={() => decrementQty(id)} 
                                className="w-8 h-9 font-semibold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors border-r border-gray-300 flex items-center justify-center cursor-pointer select-none"
                              >
                                &minus;
                              </button>
                              <input 
                                type="number" min="0" max="999" 
                                value={qty === 0 ? "" : qty} 
                                onChange={(e) => handleQuantityChange(id, e.target.value)} 
                                placeholder="0" 
                                className="w-12 text-center text-sm font-semibold focus:outline-none bg-transparent [appearance:textfield]"
                              />
                              <button 
                                type="button" 
                                onClick={() => incrementQty(id)} 
                                className="w-8 h-9 font-semibold text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors border-l border-gray-300 flex items-center justify-center cursor-pointer select-none"
                              >
                                +
                              </button>
                        </div>
                          </td>

                          {/* Subtotal Calculation Column */}
                          <td className="py-4 px-6 text-right font-bold text-gray-900 whitespace-nowrap">
                            ₹{rowSubtotal.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-xs font-semibold text-gray-400 tracking-wide bg-gray-50/50">
                    No products matching search parameters are available inside the store catalog.
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

            <FloatingCartButton />
        </div>
    );
    }
    export default QuickShop;

                            
                            
                                                        