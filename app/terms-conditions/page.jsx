'use client'
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";

const TermsAndConditions = () => {
    
    // Smooth scrolling anchor handler utility
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Sidebar navigation map dictionary layout array
    const termsSections = [
        { id: "order-placement", title: "1. Order Placement & Integrity", icon: "🛒" },
        { id: "payment-billing", title: "2. Payment Processing Fees", icon: "💳" },
        { id: "shipping-delivery", title: "3. Shipping & Logistics Rules", icon: "🚚" },
        { id: "cancellations", title: "4. Cancellations & Edits", icon: "❌" },
        { id: "returns-refunds", title: "5. Return & Refund Policies", icon: "📦" }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 text-gray-700">
            <Navbar />
            <Titlebar />

            {/* Main Interactive Framework Workspace */}
            <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-12 md:py-16">
                
                {/* Heading Document Banner */}
                <div className="flex flex-col items-start space-y-2 border-b border-gray-200 pb-6 mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        Terms & Conditions
                    </h2>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                    <p className="text-xs text-gray-400 font-medium">
                        Last Updated: August 2026 • Review the legal framework governing transactions, pricing integrity, and order processing [developer].
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative">
                    
                    {/* Left Side Navigation Anchor Sidebar Panel (Hidden on tiny viewports) */}
                    <aside className="hidden md:block w-64 shrink-0 sticky top-4 max-h-[70vh] bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
                            Terms Navigation
                        </h3>
                        <ul className="space-y-1">
                            {termsSections.map((section) => (
                                <li key={section.id}>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(section.id)}
                                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-orange-600 transition-all flex items-center gap-2 cursor-pointer select-none font-medium"
                                    >
                                        <span>{section.icon}</span>
                                        <span className="truncate">{section.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Right Side Master Text Flow Content Canvas Frame */}
                    <div className="flex-grow bg-white border border-gray-200/80 rounded-2xl p-6 md:p-8 shadow-2xs space-y-8 leading-relaxed max-w-3xl">
                        
                        {/* Section 1 */}
                        <section id="order-placement" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>1.</span> Order Placement & Integrity
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                By placing an order via our storefront checkout panel, you agree that:
                            </p>
                            <ul className="list-disc list-inside ml-2 text-xs md:text-sm text-gray-500 space-y-1.5 font-medium pl-1">
                                <li>All cart configurations submitted reflect true purchasing intent. Carts are validated reactively against true backend database stock levels to prevent inventory overselling [developer].</li>
                                <li>The server reserves the right to reject orders where technical data tampering or price-manipulation attempts (such as modifying front-end code properties) are detected by our security layer [developer].</li>
                                <li>Every successful checkout dynamically generates a distinct, unique tracking tracking code identifier (e.g., ORD-YYYYMMDD-HEX) issued straight to your registered profile or guest email line [developer].</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section id="payment-billing" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>2.</span> Payment Processing Fees
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                Financial terms are strictly managed to maintain billing accuracy across all invoices [developer]:
                            </p>
                            <ul className="list-disc list-inside ml-2 text-xs md:text-sm text-gray-500 space-y-1.5 font-medium pl-1">
                                <li><strong className="text-gray-700">Calculated Grand Totals:</strong> Your ultimate checkout amount represents the combined sum of item subtotals (using live database `offerPrice` settings), dynamic shipping logistics, and individual multi-component tax allocations (such as TAX1 State GST and TAX2 General Tax), minus active validated coupon deductions [developer].</li>
                                <li><strong className="text-gray-700">Coupon Application:</strong> Predefined codes like WELCOME10, FESTIVE500, or FREESHIP must be successfully checked inside the designated promo cell box before submission. Retrospective discount credits will not be manually applied after a transaction is committed [developer].</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section id="shipping-delivery" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>3.</span> Shipping & Logistics Rules
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                Delivery logistics are distributed systematically under the following tier structures [developer]:
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Standard shipping triggers a automatic flat rate charge of ₹150 for orders failing to cross our established spending thresholds. Carts reaching or exceeding an aggregate subtotal of ₹2,000, or checkouts successfully registering an active 'FREESHIP' promotional coupon, qualify for 100% Free Shipping.
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Shipping addresses are captured as unchangeable text block snapshots at the exact moment of order placement. This protects tracking integrity even if a registered member edits or clears their saved address setup configurations inside their profile menu afterwards [developer].
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section id="cancellations" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>4.</span> Cancellations & Edits
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                Order cancellation policies correspond explicitly to the active status flag assigned by the vendor dashboard pipeline [developer]:
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Users may execute cancellation requests only while the tracking sequence displays <strong className="text-gray-700">"Order Placed"</strong> or <strong className="text-gray-700">"Payment Pending"</strong> [developer]. Once a seller modifies the workflow indicator status flag to <strong className="text-red-600">"Shipped"</strong> or <strong className="text-red-600">"Delivered"</strong>, the logistical package enters locked fulfillment lines and can no longer be intercepted, cancelled, or altered in our database tracks [developer].
                            </p>
                        </section>

                                               {/* Section 5 */}
                        <section id="returns-refunds" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>5.</span> Return & Refund Policies
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                To protect platform trade ecosystems, returns are regulated under strict verification bounds:
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Products must be reported within our return window following successful verification delivery. Items must remain completely unaltered, untampered, and packed within their original packaging arrays. 
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Sellers inspect returned elements before authorizing dynamic balance reversals. Approved refunds are credited directly back via equivalent transaction parameters, and the seller may input custom logistics notes or tracking courier IDs inside their management field panels to provide total data visibility.
                            </p>
                        </section>

                    </div>
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default TermsAndConditions;

