"use client"
import React from "react";
import { assets, BagIcon, BoxIcon, CartIcon, HomeIcon} from "@/assets/assets";
import Link from "next/link"
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk, UserButton } from "@clerk/nextjs";

const Navbar = () => {

  const { isSeller, router, user, cartItems } = useAppContext();
  const { openSignIn } = useClerk()

  // Calculate total number of all items sitting inside the cart object safely
  const getCartItemCount = () => {
    return Object.values(cartItems || {}).reduce((acc, qty) => acc + qty, 0);
  };
  const itemCount = getCartItemCount();

  return (
    <nav className="flex items-center justify-between px-6 md:px-16 lg:px-32 py-3 border-b border-gray-300 text-gray-700">
     
    {/*  <Image
      className="cursor-pointer mr-0 w-36 md:w-48"
      onClick={() => router.push('/')}
      src={assets.brand_name}
      alt="brand"
    />*/}

    <Image
      className="cursor-pointer w-28 md:w-96"
      onClick={() => router.push('/')}
      src={assets.logo}
      alt="logo"
    />
    
      <div className="flex items-center gap-4 lg:gap-10 max-md:hidden">
        <Link href="/" className="hover:text-gray-900 transition">
          Home
        </Link>
        <Link href="/all-products" className="hover:text-gray-900 transition">
          Shop
        </Link>
        <Link href="/quick-shop" className="hover:text-gray-900 transition">
          Quick Shop
        </Link>
        <Link href="/" className="hover:text-gray-900 transition">
          About Us
        </Link>
        <Link href="/contact-enquiry" className="hover:text-gray-900 transition">
          Contact
        </Link>
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full">Seller Dashboard</button>}

      </div>
       
      {/* Desktop Menu Viewport Container */}
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

          {/* Counter Badge cleanly locked below the icon baseline */}
          {itemCount > 0 && (
            <span className="absolute top-7 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm border border-white whitespace-nowrap z-10">
              {itemCount}
            </span>
          )}
        </button>

        {
         user 
         ? <>
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={()=> router.push('/cart')}/>
            </UserButton.MenuItems>

             <UserButton.MenuItems>
              <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={()=> router.push('/my-orders')}/>
            </UserButton.MenuItems>
          </UserButton>
          </>
        : <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition" suppressHydrationWarning={true}>
          <Image src={assets.user_icon} alt="user icon" />
          Account
          </button>
        }
      </ul>

      {/* Mobile Menu Viewport Container */}
      <div className="flex items-center md:hidden gap-3">
        {isSeller && <button onClick={() => router.push('/seller')} className="text-xs border px-4 py-1.5 rounded-full" suppressHydrationWarning={true}>Seller Dashboard</button>}   
        
        {/* Added Mobile Cart Button with Active Badge Syncing */}
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

        {
         user 
         ? <>
          <UserButton>
             <UserButton.MenuItems>
              <UserButton.Action label="Home" labelIcon={<HomeIcon />} onClick={()=> router.push('/')}/>
            </UserButton.MenuItems>

            <UserButton.MenuItems>
              <UserButton.Action label="Products" labelIcon={<BoxIcon />} onClick={()=> router.push('/all-products')}/>
            </UserButton.MenuItems>

            <UserButton.MenuItems>
              <UserButton.Action label="Cart" labelIcon={<CartIcon />} onClick={()=> router.push('/cart')}/>
            </UserButton.MenuItems>

             <UserButton.MenuItems>
              <UserButton.Action label="My Orders" labelIcon={<BagIcon />} onClick={()=> router.push('/my-orders')}/>
            </UserButton.MenuItems>
          </UserButton>
          </>
        : <button onClick={openSignIn} className="flex items-center gap-2 hover:text-gray-900 transition" suppressHydrationWarning={true}> 
          <Image src={assets.user_icon} alt="user icon" />
           Login
          </button>
        }
      </div>
    </nav>
  );
};

export default Navbar;