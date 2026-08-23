import React from 'react'
import { assets } from '@/assets/assets'
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }) => {

    // 1. Destructure addToCart and showToast from global app context
    // (Ensure your context provider exports a toast handler like showToast)
    const { currency, router, addToCart, showToast, wishlist, toggleWishlist } = useAppContext()
    const pId = product._id || product.id;

      const isWishlisted = wishlist ? wishlist.includes(pId) : false;

     const handleHeartClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents clicking the heart button from opening the product details page
        toggleWishlist(pId);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation(); // Prevents navigating to the product details page
        addToCart(product._id);
        
        // 2. Trigger the toast notification alert overlay safely
        if (showToast) {
            showToast(`${product.name} added to your cart!`, 'success');
        } else {
            alert(`${product.name} added to your cart!`); // Fallback if showToast isn't in context yet
        }
    };

    const handleBuyNowClick = (e) => {
        e.stopPropagation(); 
        addToCart(product._id);
        router.push('/cart');
    };

    return (
        <div
            onClick={() => { router.push('/product/' + product._id); scrollTo(0, 0) }}
            className="flex flex-col items-start gap-0.5 max-w-[200px] w-full cursor-pointer group bg-white p-2 rounded-xl border border-transparent hover:border-gray-200 transition-all duration-300"
        >
            {/* Image viewport element frame wrapper */}
            <div className="relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
                <Image
                    src={Array.isArray(product.image) ? product.image[0] : product.image}
                    alt={product.name}
                    className="group-hover:scale-105 transition duration-300 object-cover w-4/5 h-4/5 md:w-full md:h-full"
                    width={800}
                    height={800}
                />
                
                {/* Wishlist Button Overlay Pin 
                <button 
                    type="button"
                    onClick={handleHeartClick}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md z-10 cursor-pointer hover:scale-110 transition active:scale-95"
                >
                    <Image
                        className="h-3 w-3"
                        src={assets.heart_icon}
                        alt="wishlist"
                    />
                </button>*/}

                {/* Dynamic SVG-driven Wishlist Heart Pin Overlay - Upgraded to Orange Theme */}
                <button 
                    type="button"
                    onClick={handleHeartClick}
                    className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs p-2 rounded-full shadow-md z-10 cursor-pointer hover:scale-110 active:scale-90 transition-all flex items-center justify-center border border-gray-100/50"
                    aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                    {/* FIXED: Active states map to orange values to match your custom e-commerce branding */}
                    <svg 
                        className={`h-3.5 w-4 transition-all duration-200 ${
                            isWishlisted 
                                ? "fill-orange-600 text-orange-600 scale-105" 
                                : "text-gray-400 hover:text-orange-500 fill-none"
                        }`} 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth="2.5"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M4.318 6.318a4.5 4.318 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                        />
                    </svg>
                </button>


                {/* 3. DESKTOP HOVER OVERLAY SYSTEM */}
                {/* Hidden on mobile, slides up on desktop mouse entries */}
                <div className="hidden md:flex absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 gap-2 items-center justify-center z-10">
                    <button 
                        type="button"
                        onClick={handleAddToCartClick}
                        className="flex-1 py-1.5 px-1 bg-white hover:bg-orange-50 text-orange-600 text-[10px] font-bold rounded shadow transition cursor-pointer text-center whitespace-nowrap"
                    >
                        Add to Cart
                    </button>
                    <button 
                        type="button"
                        onClick={handleBuyNowClick}
                        className="flex-1 py-1.5 px-1 bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold rounded shadow transition cursor-pointer text-center whitespace-nowrap"
                    >
                        Buy Now
                    </button>
                </div>
            </div>

            <p className="md:text-base font-semibold pt-2 w-full truncate text-gray-800">{product.name}</p>
            <p className="w-full text-xs text-gray-400 max-sm:hidden truncate">{product.description}</p>
            {/*
            <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 font-medium">{4.5}</p>
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Image
                            key={index}
                            className="h-3 w-3"
                            src={index < 4 ? assets.star_icon : assets.star_dull_icon}
                            alt="rating star"
                        />
                    ))}
                </div>
            </div>*/}

            {/* Pricing Area Layout */}
            <div className="w-full mt-1 flex flex-col justify-end flex-grow">
             <p className="text-base font-bold text-gray-900 flex items-center">
                {currency}{product.offerPrice}
                <span className="text-base font-normal text-gray-800/60 line-through ml-2">
                    {currency}{product.price}
                </span>
                </p>
                {/* 4. MOBILE VISIBILITY FALLBACK CONTAINER */}
                {/* Always visible on touch viewports, hidden entirely on desktop profiles */}
                <div className="flex md:hidden items-center gap-1.5 w-full mt-2">
                    <button 
                        type="button"
                        onClick={handleAddToCartClick}
                        className="flex-1 py-1 px-1 bg-white border border-orange-600 text-orange-600 text-[10px] font-bold rounded active:bg-orange-50 transition cursor-pointer text-center whitespace-nowrap"
                    >
                        + Cart
                    </button>
                    <button 
                        type="button"
                        onClick={handleBuyNowClick}
                        className="flex-1 py-1 px-1 bg-orange-600 border border-orange-600 text-white text-[10px] font-bold rounded active:bg-orange-700 transition cursor-pointer text-center whitespace-nowrap"
                    >
                        Buy
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductCard;
