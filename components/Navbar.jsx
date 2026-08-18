"use client"
import React, { useState } from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon, PRODUCT_CATEGORIES } from "@/assets/assets"; // Injected PRODUCT_CATEGORIES
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { isSeller, router, user, cartItems } = useAppContext();
  const { openSignIn } = useClerk();

  // Core Lifecycle States for Mobile Hamburger Drawer Panel
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryAccordionOpen, setIsCategoryAccordionOpen] = useState(false);

  // Calculate total number of all items sitting inside the cart object safely
  const getCartItemCount = () => {
    return Object.values(cartItems || {}).reduce((acc, qty) => acc + qty, 0);
  };
  const itemCount = getCartItemCount();

  // Unified Mobile Click Controller: Redirects routing and closes panel overlays
  const handleMobileNavClick = (routePath) => {
    setIsMobileMenuOpen(false);
    setIsCategoryAccordionOpen(false);
    router.push(routePath);
  };

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700 bg-white relative z-50">
      
   {/* Brand Logo Wrapper - Adjusted for High Visibility */}
     <div className="flex items-center shrink-0 -my-2 select-none overflow-hidden">
      <Image
        className="cursor-pointer w-[110px] sm:w-[140px] md:w-[180px] lg:w-[200px] xl:w-[220px] h-auto object-contain transition-all duration-200 hover:opacity-95"
        onClick={() => router.push('/')}
        src={assets.logo}
        alt="logo"
        width={320}
        height={80}
        priority
      />
    </div>
{/*
    <div className="flex items-center shrink-0 -my-2 select-none overflow-hidden">
    <Image
      className="cursor-pointer w-36 md:w-52 h-auto object-contain transition-all duration-200 hover:opacity-95"
      onClick={() => router.push('/')}
      src={assets.logo}
      alt="logo"
      width={320}
      height={80}
      priority
    />
  </div>
  */}


      {/* --- DESKTOP VIEWPORT HEADER LINKS (Hidden on Mobile) --- */}
      <div className="flex items-center gap-4 lg:gap-10 max-md:hidden font-medium text-sm">
        <Link href="/" className="hover:text-gray-900 transition">Home</Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">Shop</Link>
        <Link href="/quick-shop" className="hover:text-gray-900 transition">Quick Shop</Link>
        <Link href="/" className="hover:text-gray-900 transition">About Us</Link>
        <Link href="/contact-enquiry" className="hover:text-gray-900 transition">Contact</Link>
        {isSeller && (
          <button 
            onClick={() => router.push('/seller')} 
            className="text-xs border border-gray-300 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition cursor-pointer"
          >
            Seller Dashboard
          </button>
        )}
      </div>
       
      {/* --- DESKTOP VIEWPORT ACCOUNT & ACTIONS PANEL (Hidden on Mobile) --- */}
      <ul className="hidden md:flex items-center gap-4">
        {/* Desktop Cart Button */}
        <button 
          onClick={() => router.push('/cart')}
          className="relative flex flex-col items-center p-2 group cursor-pointer"
        >
          <Image 
            src={assets.cart_icon} 
            alt="Shopping Cart"
            className="w-6 h-6 object-contain text-gray-700 transition-colors group-hover:text-orange-600"
            width={24}
            height={24} 
          />
          {itemCount > 0 && (
            <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm border border-white whitespace-nowrap z-10">
              {itemCount}
            </span>
          )}
        </button>

        {user ? (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push('/cart')}/>
              <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push('/my-orders')}/>
            </UserButton.MenuItems>
          </UserButton>
        ) : (
          <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition font-medium text-sm cursor-pointer" suppressHydrationWarning>
            <Image src={assets.user_icon} alt="user icon" />
            Account
          </button>
        )}
      </ul>

      {/* --- MOBILE VIEWPORT CONTROLS BAR (Visible ONLY on Small Devices) --- */}
      <div className="flex items-center md:hidden gap-2">
        {/* Mobile Cart Button Shortcut */}
        <button 
          onClick={() => router.push('/cart')}
          className="relative flex flex-col items-center p-2 group cursor-pointer"
        >
          <Image 
            src={assets.cart_icon} 
            alt="Shopping Cart"
            className="w-5 h-5 object-contain text-gray-700"
            width={20}
            height={20} 
          />
          {itemCount > 0 && (
            <span className="absolute top-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-1 py-0.5 rounded-full min-w-[15px] text-center shadow-xs border border-white whitespace-nowrap z-10">
              {itemCount}
            </span>
          )}
        </button>

        {/* Clerk Authenticated User Button Icon for Mobile */}
        {user && (
          <UserButton>
             <UserButton.MenuItems>
              <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={() => router.push('/')}/>
              <UserButton.Action label="Products" labelIcon={<BoxIcon />} onClick={() => router.push('/all-products')}/>
              <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={() => router.push('/cart')}/>
              <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={() => router.push('/my-orders')}/>
            </UserButton.MenuItems>
          </UserButton>
        )}

        {/* Pure CSS Animated 3-Line Hamburger Trigger Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex flex-col justify-center gap-1 w-5 h-5 cursor-pointer group p-1 ml-1"
          aria-label="Toggle Navigation Drawer Menu"
        >
          <span className={`h-[2px] w-full bg-gray-700 rounded-full transition-all duration-300 transform origin-left ${isMobileMenuOpen ? "rotate-45 translate-x-[2px] bg-orange-600" : ""}`}></span>
          <span className={`h-[2px] w-full bg-gray-700 rounded-full transition-opacity duration-200 ${isMobileMenuOpen ? "opacity-0" : ""}`}></span>
          <span className={`h-[2px] w-full bg-gray-700 rounded-full transition-all duration-300 transform origin-left ${isMobileMenuOpen ? "-rotate-45 translate-x-[2px] bg-orange-600" : ""}`}></span>
        </button>
      </div>

      {/* --- RESPONSIVE MOBILE SLIDE-OUT OVERLAY CANVAS DRAWER --- */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => { setIsMobileMenuOpen(false); setIsCategoryAccordionOpen(false); }}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      <aside className={`
        fixed top-0 right-0 h-full w-80 bg-white p-6 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-between overflow-y-auto border-l border-gray-100
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        <div className="space-y-6">
          {/* Drawer Top Branding Header Row */}
          <div className="flex items-center justify-between border-b pb-4">
            <span className="text-base font-bold text-gray-900 tracking-tight">Navigation Menu</span>
            <button 
              type="button" 
              onClick={() => { setIsMobileMenuOpen(false); setIsCategoryAccordionOpen(false); }}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-lg active:bg-gray-200 cursor-pointer"
            >
              &times;
            </button>
          </div>

          {/* Links Collection Navigation Stack */}
          <ul className="space-y-4 font-semibold text-gray-800 text-sm">
            <li>
              <button onClick={() => handleMobileNavClick('/')} className="w-full text-left py-2 hover:text-orange-600 transition block cursor-pointer">Home</button>
            </li>
            
            {/* Dynamic Accordion Dropdown Trigger for Shop Categories */}
            <li className="flex flex-col">
              <div className="flex items-center justify-between w-full py-2 border-b border-transparent">
                <button onClick={() => handleMobileNavClick('/all-products')} className="text-left font-semibold hover:text-orange-600 transition cursor-pointer">Shop</button>
                <button 
                  type="button" 
                  onClick={() => setIsCategoryAccordionOpen(!isCategoryAccordionOpen)}
                  className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{isCategoryAccordionOpen ? "▲" : "▼"}</span> Categories
                </button>
              </div>

              {/* Nested Categories Accordion Box */}
              {isCategoryAccordionOpen && (
                <div className="bg-gray-50 border border-gray-100 p-2 rounded-xl ml-2 mt-2 space-y-1 max-h-48 overflow-y-auto animate-fade-in">
                  {["All", ...PRODUCT_CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsCategoryAccordionOpen(false);
                        router.push(`/all-products?category=${encodeURIComponent(cat)}`);
                      }}
                      className="w-full text-left py-2 px-3 hover:bg-white text-gray-600 hover:text-orange-600 text-xs font-semibold rounded-lg transition-colors capitalize cursor-pointer"
                    >
                      {cat === "All" ? "✨ All Categories" : cat}
                    </button>
                  ))}
                </div>
              )}
            </li>

            <li>
              <button onClick={() => handleMobileNavClick('/quick-shop')} className="w-full text-left py-2 hover:text-orange-600 transition block cursor-pointer">Quick Shop</button>
            </li>
            <li>
              <button onClick={() => handleMobileNavClick('/')} className="w-full text-left py-2 hover:text-orange-600 transition block cursor-pointer">About Us</button>
            </li>
            <li>
              <button onClick={() => handleMobileNavClick('/contact-enquiry')} className="w-full text-left py-2 hover:text-orange-600 transition block cursor-pointer">Contact</button>
            </li>
          </ul>
        </div>

        {/* Drawer Footer Account/Dashboard Action Button Box */}
        <div className="border-t border-gray-100 pt-4 mt-6 space-y-3">
          {!user && (
            <button 
              onClick={() => { setIsMobileMenuOpen(false); openSignIn(); }}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-3 rounded-xl transition text-center shadow-xs cursor-pointer"
              suppressHydrationWarning
            >
              Sign In Account
            </button>
          )}
          {isSeller && (
            <button 
              onClick={() => handleMobileNavClick('/seller')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs py-3 rounded-xl transition text-center shadow-xs cursor-pointer"
            >
              Seller Dashboard Portal
            </button>
          )}
        </div>
      </aside>
    </nav>
  );
};

export default Navbar;
