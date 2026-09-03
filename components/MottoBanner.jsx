'use client'
import React, { useState } from 'react';
import { assets } from '@/assets/assets';

const MottoBanner = () => {
    const mottos = [
        {
            id: 1,
            title: "Safety First",
            slogan: "Your Safety Is Our Standard",
            imageSrc: assets.safety_banner || assets.safety_icon || assets.box_icon,
            bgColor: "bg-red-50/60 hover:bg-red-50/90",
            borderColor: "border-red-200/50 hover:border-red-400/80",
            textColor: "text-red-700",
            accentColor: "bg-red-600"
        },
        {
            id: 2,
            title: "Premium Quality",
            slogan: "Quality Products Guaranteed",
            imageSrc: assets.quality_banner || assets.quality_icon || assets.box_icon,
            bgColor: "bg-orange-50/60 hover:bg-orange-50/90",
            borderColor: "border-orange-200/50 hover:border-orange-400/80",
            textColor: "text-orange-700",
            accentColor: "bg-orange-600"
        },
        {
            id: 3,
            title: "Best Discounted Price",
            slogan: "Factory Prices on First-Class Items",
            imageSrc: assets.price_banner || assets.price_icon || assets.box_icon,
            bgColor: "bg-green-50/60 hover:bg-green-50/90",
            borderColor: "border-green-200/50 hover:border-green-400/80",
            textColor: "text-green-700",
            accentColor: "bg-green-600"
        },
        {
            id: 4,
            title: "Customer Service",
            slogan: "Premium Customer Support -24/7",
            imageSrc: assets.support_banner || assets.support_icon || assets.box_icon,
            bgColor: "bg-blue-50/60 hover:bg-blue-50/90",
            borderColor: "border-blue-200/50 hover:border-blue-400/80",
            textColor: "text-blue-700",
            accentColor: "bg-blue-600"
        }
    ];

    // Local tracking state hook captures the index of the column being hovered
    const [hoveredIdx, setHoveredIdx] = useState(null);

    return (
        <div className="w-full max-w-12xl mx-auto mt-16 px-4 select-none">
            {/* Master Header Overview Text Section */}
            <div className="flex flex-col items-center mb-10 text-center">
                <h2 className="text-3xl md:text-3xl font-medium text-gray-750 tracking-tight">
                    Our Core Principles
                </h2>
                <div className="w-28 h-0.5 bg-orange-600 rounded-full mt-2"></div>
            </div>

            {/* 
                FIXED SIMULTANEOUS CONTAINER:
                Renders stacked rows on mobile viewports and transitions into an interactive expanding flex accordion layout on screen widths above 1024px.
            */}
            <div className="flex flex-col lg:flex-row gap-1 w-full min-h-[250px] lg:h-[300px]">
                {mottos.map((motto, idx) => {
                    const isCurrentHovered = hoveredIdx === idx;
                    const isAnyHovered = hoveredIdx !== null;

                    // Calculate flexible column width weights based on hover interactions dynamically
                    let flexWidthClass = "lg:flex-1"; // Default uniform split layout state width 
                    if (isAnyHovered) {
                        flexWidthClass = isCurrentHovered ? "lg:flex-[2.2]" : "lg:flex-[0.6]";
                    }

                    return (
                        <div
                            key={motto.id}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            className={`w-full ${flexWidthClass} rounded-2xl border ${motto.borderColor} ${motto.bgColor} p-5 shadow-3xs relative overflow-hidden transition-all duration-500 ease-out flex flex-col justify-between group`}
                        >
                            {/* Visual Left Sidebar Brand Stripe Node */}
                            <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${motto.accentColor}`} />

                            {/* Core Text Section Component Wrapper */}
                            <div className="pl-2 space-y-1 w-full text-left">
                                <h4 className={`text-xs font-black uppercase tracking-widest ${motto.textColor}`}>
                                    {motto.title}
                                </h4>
                                <p className={`text-gray-700 font-semibold tracking-tight transition-all duration-300 leading-snug ${
                                    isCurrentHovered ? 'text-base md:text-lg' : 'text-sm'
                                } ${!isCurrentHovered && isAnyHovered ? 'lg:opacity-40 lg:line-clamp-1' : 'line-clamp-2'}`}>
                                    {motto.slogan}
                                </p>
                            </div>

                            {/* Lower Segment: Generous artwork display canvas area container */}
                            <div className={`w-full mt-4 bg-white/95 rounded-xl border border-gray-100/80 shadow-3xs flex items-center justify-center overflow-none transition-all duration-500 ${
                                isCurrentHovered ? 'h-48 lg:h-52 opacity-100 scale-100' : 
                                isAnyHovered ? 'h-40 lg:h-0 lg:opacity-0 lg:scale-95' : 'h-44 lg:h-44 opacity-90'
                            }`}>
                                <img
                                    src={typeof motto.imageSrc === 'object' ? motto.imageSrc.src : motto.imageSrc}
                                    alt={`${motto.title} Promise Illustration`}
                                    // FIXED: Object-cover forces the graphic bounds to stretch and fully fill the bounding canvas box dimensions precisely
                                    className="w-100 h-100 object-cover select-none transition-transform duration-500 group-hover:scale-98"
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MottoBanner;
