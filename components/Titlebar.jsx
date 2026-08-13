"use client"
import React, { useState, useRef, useEffect } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import { useClerk } from "@clerk/nextjs";

const Titlebar = () => {
  const { router, user, products } = useAppContext();
  const { openSignIn } = useClerk();

  // Search State Managers
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1); // Tracks arrow key navigation positioning
  
  const dropdownRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Filter products matching search token string
  const filteredProducts = searchQuery.trim() === "" 
    ? [] 
    : products?.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || [];

  // Reset focus positioning index whenever the query string changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchQuery]);

  // Handle keyboard event loop navigation (Up, Down, Enter, Escape)
  const handleKeyDown = (e) => {
    if (filteredProducts.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault(); // Prevents input text cursor shifting
        setShowDropdown(true);
        setFocusedIndex((prevIndex) => 
          prevIndex < filteredProducts.length - 1 ? prevIndex + 1 : 0
        );
        break;
        
      case "ArrowUp":
        e.preventDefault();
        setShowDropdown(true);
        setFocusedIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : filteredProducts.length - 1
        );
        break;
        
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredProducts.length) {
          const selectedProduct = filteredProducts[focusedIndex];
          const targetId = selectedProduct.id || selectedProduct._id;
          
          // Action route dispatch trigger
          router.push(`/product/${targetId}`);
          setSearchQuery("");
          setShowDropdown(false);
        }
        break;
        
      case "Escape":
        setShowDropdown(false);
        setFocusedIndex(-1);
        break;
        
      default:
        break;
    }
  };

  // Scroll active list item element cleanly into container view window dynamically
  useEffect(() => {
    if (focusedIndex >= 0 && resultsContainerRef.current) {
      const activeElement = resultsContainerRef.current.children[focusedIndex];
      if (activeElement) {
        activeElement.scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [focusedIndex]);

  // Close search auto-suggest panel when user clicks anywhere outside the input tracking zone
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="grid grid-cols-3 items-center px-6 md:px-16 lg:px-32 py-3 bg-orange-500 border-b border-orange-600 text-white relative">
      
      {/* Left Column: User Welcome Message */}
      <div className="flex gap-4 lg:gap-8 max-md:hidden">
        {user && <span className="text-sm font-medium">Welcome {user.firstName} !!</span>}       
      </div>    

      {/* Center Column: Search Box and Dropdown Container */}
      <div className="flex justify-center items-center col-span-3 md:col-span-1" ref={dropdownRef}>
        <div className="relative flex flex-col w-full max-w-[200px] md:max-w-xs transition-all duration-300 ease-in-out focus-within:max-w-[300px] md:focus-within:max-w-md">
          
          {/* Input field wrapper */}
          <div className="relative flex items-center w-full">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search products..." 
              className="w-full border border-gray-300 rounded-md py-1.5 pl-3 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 bg-gray-50 transition-colors"
            />
            <Image 
              className="w-4 h-4 absolute right-3 pointer-events-none opacity-60" 
              src={assets.search_icon} 
              alt="search icon" 
            />
          </div>

          {/* Interactive Live Search Result Dropdown Overlay */}
          {showDropdown && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
              {filteredProducts.length > 0 ? (
                <ul ref={resultsContainerRef} className="py-1.5">
                  {filteredProducts.map((product, index) => {
                    const targetId = product.id || product._id;
                    const isFocused = index === focusedIndex;
                    
                    return (
                      <li key={targetId}>
                        <Link 
                          href={`/product/${targetId}`}
                          onClick={() => {
                            setSearchQuery("");
                            setShowDropdown(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-2 transition-colors text-sm text-gray-700 ${
                            isFocused ? "bg-orange-50 text-orange-700 font-medium" : "hover:bg-gray-50"
                          }`}
                        >
                          {product.image && (
                            <div className="relative w-8 h-8 rounded border border-gray-100 overflow-hidden shrink-0">
                              <img 
                                src={Array.isArray(product.image) ? product.image[0] : product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex flex-col truncate">
                            <span className="truncate">{product.name}</span>
                            <span className={`text-xs ${isFocused ? "text-orange-400" : "text-gray-400"}`}>
                              {product.category}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-3 text-xs text-gray-400 text-center font-medium">
                  No products match your search.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
  
      {/* Right Column: Mobile Contact */}
      <div className="font-medium text-lg justify-self-end items-center max-md:hidden">
        Mobile : <span className="text-white-600">(+91) 123 456 7890</span>
      </div>

    </nav>
  );
};

export default Titlebar;
