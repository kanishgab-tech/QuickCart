'use client'
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import FloatingCartButton from "@/components/FloatingCartButton";

const AboutUsPage = () => {
    // 1. Structural configuration data mapping your 4 primary value nodes
    const valuePillars = [
        {
            id: 1,
            title: "Premium Quality",
            icon: "⭐",
            description: "We source our festive products directly from top-tier certified manufacturing hubs. Every cracker undergoes multi-stage pressure tests to ensure brilliant ignition and stable aerial bursts.",
            accent: "border-orange-500 bg-orange-50/40 text-orange-700"
        },
        {
            id: 2,
            title: "Factory-Direct Discounted Pricing",
            icon: "🏷️",
            description: "By cutting out the middlemen and structural broker layers, we bring you first-class items straight from the production floors at genuine wholesale costs—saving you money on every box.",
            accent: "border-green-500 bg-green-50/40 text-green-700"
        },
        {
            id: 3,
            title: "Festive Offers & Combos",
            icon: "🎁",
            description: "Celebrate bigger with our custom-curated combo packs and bulk discounts. Look out for our limited-time seasonal coupons and free shipping milestones during major festivals.",
            accent: "border-blue-500 bg-blue-50/40 text-blue-700"
        },
        {
            id: 4,
            title: "Strict Safety Instructions",
            icon: "🔒",
            description: "Your safety is our standard. All inventory lines carry formal certification stamps and clear safety labels, providing a secure, worry-free celebration for your entire family.",
            accent: "border-red-500 bg-red-50/40 text-red-700"
        }
    ];

    // 2. Clear, structured guidelines for handling fireworks responsibly
    const safetyRules = [
        "Always store crackers inside a tightly sealed container box, far away from active kitchen spaces or open sparks.",
        "Ensure children are supervised by an adult at all times when handling sparklers or ground chakkars.",
        "Always light fireworks outdoors in clear, wide-open spaces, away from dry foliage, vehicles, or overhead power lines.",
        "Keep a full bucket of clean water or loose sand nearby to extinguish used sparklers and flower pots safely."
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Sticky Header Navigation Component Stack */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-2xs">
                <Navbar />
                <Titlebar />
            </div>

            {/* Main Content Layout Container */}
            <div className="flex-grow w-full max-w-5xl mx-auto px-6 md:px-12 py-14 select-none">
                
                {/* Section A: Main Brand Narrative Header Intro */}
                <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-tight">
                        About <span className="text-orange-600">KanSan Crackers</span>
                    </h1>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-2.5"></div>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed mt-4 font-medium">
                        Since our inception, we have been dedicated to illuminating your most cherished family celebrations. We stand firmly at the intersection of brilliant innovation, unbeatable value, and absolute product safety [customer service].
                    </p>
                </div>

                {/* Section B: Grid Layout Showcasing Core Commitments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 w-full">
                    {valuePillars.map((pillar) => (
                        <div 
                            key={pillar.id}
                            className={`border rounded-2xl p-6 bg-white shadow-3xs transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5 flex flex-col items-start gap-3 border-gray-200/80`}
                        >
                            <span className="text-2xl bg-white rounded-xl border border-gray-100 shadow-3xs p-2 flex items-center justify-center select-none">
                                {pillar.icon}
                            </span>
                            <div className="space-y-1 text-left">
                                <h3 className="text-gray-900 font-extrabold text-base tracking-tight">
                                    {pillar.title}
                                </h3>
                                <p className="text-gray-400 font-medium text-xs leading-relaxed">
                                    {pillar.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Section C: Dedicated Safety Instructions Card Panel */}
                <div className="w-full bg-red-50/40 border border-red-200/60 rounded-2xl p-6 md:p-8 shadow-3xs relative overflow-hidden">
                    <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-red-600" />
                    
                    <div className="flex flex-col items-start text-left pl-2">
                        <h2 className="text-lg font-black text-red-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <span>🚨</span> Official Safety Guidelines
                        </h2>
                        <p className="text-gray-500 text-xs font-semibold mb-6 max-w-xl leading-normal">
                            Fireworks create beautiful memories when handled responsibly. Please ensure your celebration aligns with these core safety recommendations:
                        </p>

                        {/* List rendering safety instructions */}
                        <ul className="w-full space-y-3">
                            {safetyRules.map((rule, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-gray-700 leading-relaxed">
                                    <span className="font-mono font-black text-red-600 bg-white border border-red-100 rounded-md w-5 h-5 flex items-center justify-center shrink-0 shadow-3xs text-[10px]">
                                        {idx + 1}
                                    </span>
                                    <p className="flex-1 pt-0.5">{rule}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            {/* Floating Navigation Button and Footer Wrapper */}
            <FloatingCartButton />
            <Footer />
        </div>
    );
};

export default AboutUsPage;
