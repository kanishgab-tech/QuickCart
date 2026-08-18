'use client'
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";

const PrivacyPolicy = () => {
    
    // Smooth scrolling anchor handler utility
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Sidebar navigation map dictionary layout array
    const policySections = [
        { id: "data-collection", title: "1. Information We Collect", icon: "📝" },
        { id: "data-usage", title: "2. How We Use Your Data", icon: "⚙️" },
        { id: "data-protection", title: "3. Database Security & Retention", icon: "🛡️" },
        { id: "data-sharing", title: "4. Third-Party Protocols", icon: "🤝" },
        { id: "user-rights", title: "5. Your Control & Rights", icon: "⚖️" }
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
                        Privacy Policy
                    </h2>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                    <p className="text-xs text-gray-400 font-medium">
                        Last Updated: August 2026 • Review how we maintain and safeguard your database profile attributes securely.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative">
                    
                    {/* Left Side Navigation Anchor Sidebar Panel (Hidden on tiny viewports) */}
                    <aside className="hidden md:block w-64 shrink-0 sticky top-4 max-h-[70vh] bg-white border border-gray-200/80 rounded-2xl p-4 shadow-2xs">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
                            Policy Navigation
                        </h3>
                        <ul className="space-y-1">
                            {policySections.map((section) => (
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
                        <section id="data-collection" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>1.</span> Information We Collect
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                To process storefront checkouts fluidly, we collect specific parameters during the ordering pipeline lifecycle depending on your session status:
                            </p>
                            <ul className="list-disc list-inside ml-2 text-xs md:text-sm text-gray-500 space-y-1.5 font-medium pl-1">
                                <li><strong className="text-gray-700">Account Profiles:</strong> Name, secure tokenized user identifiers synced via Clerk integration protocols.</li>
                                <li><strong className="text-gray-700">Contact Details:</strong> Verified email strings (both registered account records and manual input guest user checkouts) and phone numbers.</li>
                                <li><strong className="text-gray-700">Fulfillment Addresses:</strong> Flat plain text block snapshot definitions containing area entries, landmarks, cities, states, and pincodes to coordinate logistics.</li>
                            </ul>
                        </section>

                        {/* Section 2 */}
                        <section id="data-usage" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>2.</span> How We Use Your Data
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                Your information parameters are exclusively contained within business verification operations. We strictly use your properties to:
                            </p>
                            <ul className="list-disc list-inside ml-2 text-xs md:text-sm text-gray-500 space-y-1.5 font-medium pl-1">
                                <li>Recalculate invoice totals, cross-verify multiple tax allocations dynamically, and evaluate coupon code deductions safely.</li>
                                <li>Populate your dashboard transaction data rows so sellers can review processing fulfillment tracking logs or add delivery text updates.</li>
                                <li>Transmit automated alphanumeric confirmation receipts (e.g., KSC-YYYYMMDD-HEX) straight to your designated inbox lines via asynchronous background microservices.</li>
                            </ul>
                        </section>

                        {/* Section 3 */}
                        <section id="data-protection" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>3.</span> Database Security & Retention
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                Data protection is a core architecture priority. Your parameters are safeguarded under strict database policies:
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Delivery coordinates are stored inside our secure MongoDB cluster as immutable text block snapshots the millisecond an order is placed. This guarantees that if you alter or wipe your current profile address settings later, historic sales summaries and financial ledgers remain completely accurate and protected against deletion leakage.
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                We maintain industry-standard memory protection rings. Passwords and identity credentials are fully sandboxed and are never handled or logged directly onto our server repositories.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section id="data-sharing" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>4.</span> Third-Party Protocols
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                We do <span className="text-red-600 font-bold">NOT</span> sell, rent, lease, or barter your private phone numbers, emails, or personal identification blocks to independent tracking syndicates or advertisement firms. 
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Information tokens are exposed strictly to required system partners (like Clerk for session handshakes, Cloudinary for hosting static asset lists, and Inngest for orchestrating background message queue threads) solely to execute core marketplace loops.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section id="user-rights" className="space-y-3 scroll-mt-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span>5.</span> Your Control & Rights
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                                You retain total control over your dynamic data entries at all times. Registered users can log into their setup profiles to update metadata fields or empty active cart records anytime. 
                            </p>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                If you require a complete permanent erasure of your past guest customer logs or need manual technical checkout assistance, you may dispatch an entry to our management team via our designated contact channels immediately.

                            </p>
                            </section>
                        </div>
                    </div>
         </main>
        <Footer />
        </div>
                    
);
};
export default PrivacyPolicy;