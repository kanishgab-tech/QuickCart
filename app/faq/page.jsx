'use client'
import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";

const FAQPage = () => {
    // 1. Core State Lifecycle Managers
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [openIndex, setOpenIndex] = useState(null); // Tracks currently expanded accordion block

    // 2. Predefined Centralized FAQ Content Repository Matrix
    const FAQ_DATA = [
        {
            id: 1,
            category: "orders",
            question: "How do I check my order status or reference details?",
            answer: "You can track your package updates easily. Logged-in users can view their active history directly in the 'My Orders' account button panel. If you checked out as a guest, check your contact confirmation email receipt for your unique alphanumerical tracking tracking number code (e.g., ORD-YYYYMMDD-HEX)."
        },
        {
            id: 2,
            category: "promos",
            question: "How do I apply promotional discount coupon codes?",
            answer: "When checking out, locate the 'PROMO CODE' input text cell directly inside your Order Summary card layout block. Type your code (e.g., WELCOME10 or FESTIVE500) and click 'Apply'. The system will instantly recalculate subtotals, cash deductions, or shipping logistics costs dynamically on your screen."
        },
        {
            id: 3,
            category: "shipping",
            question: "What are your delivery fee charges and tier thresholds?",
            answer: "Shipping logistics charges are calculated fluidly based on your aggregate order values. Standard delivery handles an automatic flat rate of ₹150. However, if your cart subtotal reaches or exceeds ₹2,000, or if you apply the valid 'FREESHIP' promotional coupon code, shipping automatically toggles to 100% Free."
        },
        {
            id: 4,
            category: "orders",
            question: "Can I edit or cancel an active order once placed?",
            answer: "Sellers begin processing fulfillment quickly. If your order status is marked as 'Order Placed' or 'Payment Pending', you can request adjustments by contacting support. However, once the status flag updates to 'Shipped' or 'Delivered', the record enters locked fulfillment lines and can no longer be modified."
        },
        {
            id: 5,
            category: "taxes",
            question: "How are the GST and federal taxes calculated on my checkout?",
            answer: "Taxes are evaluated automatically using itemized multi-component structures (e.g., TAX1 State GST at 5%, TAX2 Federal General at 2%). The percentage ratios compile directly against your post-discount taxable basis subtotal, ensuring completely transparent invoice billing rows."
        }
    ];

    // Unique Categories Filter Array Generator
    const menuCategories = [
        { id: "all", label: "✨ All FAQs" },
        { id: "orders", label: "📦 Orders & Tracking" },
        { id: "promos", label: "🏷️ Promo Coupons" },
        { id: "shipping", label: "🚚 Shipping Costs" },
        { id: "taxes", label: "⚖️ Billing & Taxes" }
    ];

    // 3. High-Performance Search and Category Filtering Pipeline
    const filteredFAQs = useMemo(() => {
        return FAQ_DATA.filter((faq) => {
            const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
            const matchesSearch = 
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, activeCategory]);

    // Accordion click toggle loop controller
    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 text-gray-700">
            <Navbar />
            <Titlebar />

            {/* Main Interactive Workspace Container */}
            <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-12 space-y-8">
                
                {/* Heading Banner Area */}
                <div className="flex flex-col items-center text-center space-y-2">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        How can we help you today?
                    </h2>
                    <div className="w-12 h-1 bg-orange-600 rounded-full"></div>
                    <p className="text-xs text-gray-500 max-w-md pt-1">
                        Find instant interactive answers regarding order workflows, shipping parameters, or promo code structures.
                    </p>
                </div>

                {/* Real-time Filter Search Input Field Box */}
                <div className="relative max-w-xl mx-auto">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setOpenIndex(null); // Reset unrolled rows during active key typing
                        }}
                        placeholder="Type keywords to filter questions... (e.g. shipping, coupon)"
                        className="w-full bg-white border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition shadow-2xs font-medium h-12"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 select-none text-base">🔍</span>
                    {searchQuery && (
                        <button 
                            type="button" 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer"
                        >
                            &times;
                        </button>
                    )}
                </div>

                {/* Segment Filter Menu Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
                    {menuCategories.map((cat) => {
                        const isSelected = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setOpenIndex(null); // Collapse views upon segment switches
                                }}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border active:scale-[0.98] select-none cursor-pointer ${
                                    isSelected
                                        ? "bg-orange-600 border-orange-600 text-white shadow-xs"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 shadow-2xs"
                                }`}
                            >
                                {cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Dynamic Interactive Accordion Rows List viewport */}
                <div className="space-y-3 max-w-3xl mx-auto pt-2">
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map((faq, index) => {
                            const isExpanded = openIndex === index;
                            return (
                                <div 
                                    key={faq.id} 
                                    className={`bg-white border rounded-2xl shadow-2xs overflow-hidden transition-all duration-200 ${
                                        isExpanded ? "border-orange-200 ring-1 ring-orange-500/5 shadow-xs" : "border-gray-200/80"
                                    }`}
                                >
                                    {/* Question Expand Trigger Header */}
                                    <button
                                        type="button"
                                        onClick={() => toggleAccordion(index)}
                                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-sm text-gray-900 hover:bg-gray-50/50 transition-colors cursor-pointer select-none group"
                                    >
                                        <span className={`group-hover:text-orange-600 transition-colors ${isExpanded ? "text-orange-600 font-bold" : ""}`}>
                                            {faq.question}
                                        </span>
                                        <span className={`text-xs p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:text-orange-600 transition-all font-bold shrink-0 ${
                                            isExpanded ? "rotate-180 bg-orange-50 text-orange-600" : ""
                                        }`}>
                                            ▼
                                        </span>
                                    </button>

                                                                       {/* Interactive Answer Slide Panel Container */}
                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                        isExpanded ? "max-h-48 border-t border-gray-100 bg-gray-50/30" : "max-h-0"
                                    }`}>
                                        <p className="p-5 text-xs md:text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        // Empty Filter Placeholder Grid Screen
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/70 p-6 shadow-2xs">
                            <span className="text-3xl block mb-2">🔍</span>
                            <p className="text-sm font-semibold text-gray-800">No results found</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                We couldn't find any questions matching your search queries. Try checking spelling or keywords.
                            </p>
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default FAQPage;
