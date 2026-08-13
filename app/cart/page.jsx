'use client'
import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";

// --- NEW COMPONENT FOR ISOLATED ROW INPUT CONTROL ---
const CartRow = ({ itemId, initialQty, product, updateCartQuantity, addToCart }) => {
  // Store the local string value so the user can wipe the text box completely blank without breaking
  const [localQty, setLocalQty] = useState(initialQty.toString());

  // Keep local view synced if global context changes via +/- click controls
  useEffect(() => {
    
    if (initialQty <= 999) {
      setLocalQty(initialQty.toString());
    } else {
      setLocalQty("999");
    }

  }, [initialQty]);

   const handleKeyDown = (e) => {
    // Block minus (-), plus (+), decimal point (.), and exponential scientific notation (e)
    if (['-', '+', '.', 'e', 'E'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;

    setLocalQty(val);

    // Sync down to context immediately ONLY if it's a valid integer greater than 0
    const numericVal = parseInt(val, 10);
    if (!isNaN(numericVal) && numericVal > 0) {
      updateCartQuantity(product._id, numericVal);
    }
  };

  const handleBlur = () => {
    const numericVal = parseInt(localQty, 10);
    
    // If blank, 0, or invalid when user clicks away, finalize deletion
    if (isNaN(numericVal) || numericVal <= 0) {
      updateCartQuantity(product._id, 0);
    } else {
      const cappedVal = Math.min(numericVal, 999);
      updateCartQuantity(product._id, cappedVal);
    }
  };

  return (
    <tr>
      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
        <div>
          <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
            <Image
              src={product.image[0]}
              alt={product.name}
              className="w-16 h-auto object-cover mix-blend-multiply"
              width={1280}
              height={720}
            />
          </div>
          <button
            type="button"
            className="md:hidden text-xs text-orange-600 mt-1"
            onClick={() => updateCartQuantity(product._id, 0)}
          >
            Remove
          </button>
        </div>
        <div className="text-sm hidden md:block">
          <p className="text-gray-800">{product.name}</p>
          <button
            type="button"
            className="text-xs text-orange-600 mt-1"
            onClick={() => updateCartQuantity(product._id, 0)}
          >
            Remove
          </button>
        </div>
      </td>
      <td className="py-4 md:px-4 px-1 text-gray-600">${product.offerPrice}</td>
      <td className="py-4 md:px-4 px-1">
        <div className="flex items-center md:gap-2 gap-1">
          <button type="button" onClick={() => updateCartQuantity(product._id, Math.max(0, initialQty - 1))}>
            &minus;
          </button>
               {/* FIXED: Swapped w-8 to w-14 so 4 digits fit cleanly, added max="999", px-1 for safety padding */}
          <input 
            type="number" 
            min="0"
            max="999"
            value={localQty} 
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-14 border text-center px-1 py-0.5 rounded text-sm appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
         {/* Prevent increments above 999 */}
          <button 
            type="button" 
            onClick={() => initialQty < 999 && addToCart(product._id)}
            disabled={initialQty >= 999}
            className={initialQty >= 999 ? "opacity-40 cursor-not-allowed" : ""}
          >
            +
          </button>

        </div>
      </td>
      <td className="py-4 md:px-4 px-1 text-gray-600">
        ${(product.offerPrice * initialQty).toFixed(2)}
      </td>
    </tr>
  );
};

// --- MAIN MASTER VIEW ---
const Cart = () => {
  const { products, router, cartItems, addToCart, updateCartQuantity, getCartCount } = useAppContext();

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">{getCartCount()} Items</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="text-left">
                <tr>
                  <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Product Details 
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Price
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Quantity
                  </th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(cartItems).map((itemId) => {
                  const product = products.find(product => product._id === itemId);
                  const globalQty = cartItems[itemId];

                  // ONLY reject items completely missing or ALREADY finalized at 0 on mount
                  if (!product || globalQty <= 0) return null;

                  return (
                    <CartRow 
                      key={itemId}
                      itemId={itemId}
                      initialQty={globalQty}
                      product={product}
                      updateCartQuantity={updateCartQuantity}
                      addToCart={addToCart}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          <button onClick={() => router.push('/all-products')} className="group flex items-center mt-6 gap-2 text-orange-600">
            <Image
              className="group-hover:-translate-x-1 transition"
              src={assets.arrow_right_icon_colored}
              alt="arrow_right_icon_colored"
            />
            Continue Shopping
          </button>
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
