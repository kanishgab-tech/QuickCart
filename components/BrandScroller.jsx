'use client'
import React from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets'; // Adjust this path to match your asset structure
import { useAppContext } from '@/context/AppContext';

const BrandScroller = () => {
    const { router } = useAppContext();
    // 1. Define your brand logos list. (Replace placeholders with your real asset pointers)
    const brandsList = [
        { id: 1, name: "KanSan", logo: assets.logo },
        { id: 2, name: "Standard", logo: assets.standard_logo },
        { id: 3, name: "Ayyan", logo: assets.ayyan_brand_logo },
        { id: 4, name: "Asok", logo: assets.asok_fireworks_logo },
        { id: 5, name: "Wowstar", logo: assets.wowstar_logo },
        { id: 6, name: "Elephant", logo: assets.elephant_logo },
    ];

    // 2. Duplicate the array list to create a seamless, infinite illusion track loop
    const infiniteBrands = [...brandsList, ...brandsList, ...brandsList];

    return (
        <div className="w-full bg-[#E6E9F2] border-y border-gray-200/60 py-10 mt-14 overflow-hidden relative select-none rounded-xl min-w-full">
            {/* Header Content Alignment Section */}
            <div className="flex flex-col items-center mb-8 text-center px-4">
                <h2 className="text-3xl md:text-3xl font-medium max-w-[290px]">
                    Brands We Sell
                </h2>
                <div className="w-28 h-0.5 bg-orange-600 rounded-full mt-2"></div>
                <p className="max-w-[343px] font-medium text-gray-800/60">
                    Premier Producers
                </p>
                
            </div>

            {/* Scrolling Track Mask Container */}
            <div className="flex w-full overflow-hidden relative mask-gradient-x">
                {/* 
                   FIXED INFINITE MARQUEE ANIMATION TRACK: 
                   Moves right-to-left. Pauses automatically if a user hovers their mouse cursor.
                */}
                <div className="flex gap-8 items-center justify-start shrink-0 animate-marquee min-w-full hover:[animation-play-state:paused]">
                    {infiniteBrands.map((brand, idx) => (
                                               <div 
                            key={`${brand.id}-${idx}`}
                            onClick={() => {
                                const encodedBrand = encodeURIComponent(brand.name);
                                router.push(`/all-products?brand=${encodedBrand}`);
                                if (typeof window !== "undefined") window.scrollTo(0, 0);
                            }}
                            // FIXED HEIGHT CONTRAINT: Swapped 'h-28 sm:h-32' for 'h-auto' so the new text line doesn't overflow the container box boundaries
                            className="w-28 sm:w-32 bg-white border border-gray-200 rounded-2xl flex flex-col items-center justify-start p-3 shrink-0 shadow-3xs transition-all duration-300 hover:border-orange-500 hover:shadow-sm active:scale-95 group cursor-pointer"
                            title={`Click to view all products by ${brand.name}`}
                        >
                            {/* SQUARE ICON ELEMENT WRAPPER CONTAINER */}
                            <div className="w-full relative aspect-square overflow-hidden bg-gray-50/50 rounded-xl flex items-center justify-center border border-gray-100 p-2">
                                <Image
                                    src={brand.logo}
                                    alt={`${brand.name} Corporate Logo`}
                                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-108"
                                    width={120}
                                    height={120}
                                    unoptimized={true}
                                />
                            </div>

                            {/* FIXED NEW PLACEMENT: Displays your Brand Name clearly below the logo box canvas */}
                            <div className="mt-2.5 w-full text-center">
                                <p className="text-gray-700 font-normal text-xs sm:text-sm tracking-tight truncate group-hover:text-orange-600 transition-colors duration-200 capitalize">
                                    {brand.name}
                                </p>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
            
            {/* Add customized inner loop tracking CSS parameters into the global DOM context scope */}
            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee 60s linear infinite;
                }
                .mask-gradient-x {
                    mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, white 15%, white 85%, transparent);
                }
            `}</style>
        </div>
    );
};

export default BrandScroller;
