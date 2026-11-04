'use client'
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import FloatingCartButton from "@/components/FloatingCartButton";

// --- STEP 1: ISOLATED ACCORDION ITEM COMPONENT ---
const FaqItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    

    return (
        <div className="border border-gray-200 bg-white rounded-xl overflow-hidden transition-all duration-200 shadow-3xs">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-gray-900 text-sm cursor-pointer select-none transition-colors hover:bg-gray-50/60"
            >
                <span>{question}</span>
                <span className={`text-orange-600 font-mono text-base transition-transform duration-200 transform shrink-0 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    ▼
                </span>
            </button>
            
            {/* Smooth height layout container transition */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[200px] border-t border-gray-100' : 'max-h-0'}`}>
                <p className="p-5 text-gray-500 font-medium text-xs leading-relaxed bg-gray-50/30">
                    {answer}
                </p>
            </div>
        </div>
    );
};

// --- MAIN MASTER PAGE COMPONENT ---
const AboutUsPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);
   
    const [safetyTab, setSafetyTab] = useState("dos");

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            {/* Sticky Header Navigation Component Stack */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-2xs">
                <Navbar />
                <Titlebar />
            </div>

               <div className="flex-grow w-full max-w-[95%] sm:max-w-[90%] xl:max-w-[85%] 2xl:max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-14 select-none">
                
                {/* SECTION A: Main Hero Header Introduction - FIXED: Widened text row allocation limit to max-w-5xl */}
                 <div className="flex flex-col items-center text-center w-full max-w-full mx-auto mb-16">
     
                   
                    <h1 className="text-3xl md:text-4xl font-normal text-gray-700 tracking-tight">
                        Welcome to <span className="text-orange-600">KanSan Crackers</span>
                    </h1>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-3"></div>
                   <h1> </h1>
                   <h1 className="text-3xl md:text-4xl justify-left font-normal text-gray-700 tracking-tight">
                       About Us
                    </h1>
                    

                    <p className="text-medium md:text-base leading-relaxed font-normal mt-3 border-l-2 border-orange-500/100 pl-4 c max-w-8xl">
                        Every festival brings people together, creates beautiful memories, and adds color to our lives. Thank you for choosing <b>KanSan Crackers</b> on your those special moments. We are the wholesale dealer of fireworks and crackers owning a shop in Sivakasi, Tamilnadu.We sell crackers for your special events and celebrations throughout the year. Our journey is built on a strong commitment to quality, value, and customer satisfaction. From traditional sparklers and flower pots to colorful ground crackers and spectacular aerial shots, our collection offers something for every celebration and every age group.
                    </p>
                    <div className="flex items-center my-1 w-full max-w-2xl">
                        <div className="flex-grow border-t border-orange-500/20"></div>
                        <span className="mx-4 text-orange-500/100 text-lg">★</span>
                        <div className="flex-grow border-t border-orange-500/20"></div>
                    </div>
                    <h4 className="text-sm md:text-lg font-semibold mt-6">  
                       Quality at the Heart of What We Do
                    </h4>

                    <p className="text-medium md:text-base leading-relaxed font-normal mt-3 border-l-2 border-orange-500/100 pl-4 c max-w-8xl">
                        At KanSan Crackers, we believe that great celebrations begin with products you can trust. We pay close attention to product quality and packaging while working with reliable suppliers to bring you a diverse selection of fireworks at competitive prices.
                        Our goal is to provide customers with a convenient <b> one-stop destination for their Diwali and festive fireworks needs</b>. Whether you are shopping for your family, planning a community celebration, or looking for festive gift hampers, we strive to make your shopping experience simple and enjoyable.
                    </p>

                    <div className="flex items-center my-1 w-full max-w-2xl">
                        <div className="flex-grow border-t border-orange-500/20"></div>
                        <span className="mx-4 text-orange-500/100 text-lg">★</span>
                        <div className="flex-grow border-t border-orange-500/20"></div>
                    </div>


                    <h4 className="text-gray-700 text-sm md:text-lg font-semibold mt-6">  
                       Celebrating with Care
                    </h4>

                     <p className="text-medium md:text-base leading-relaxed font-normal mt-3 border-l-2 border-orange-500/100 pl-4 c max-w-8xl">
                        Celebrations are most meaningful when they are enjoyed responsibly. We encourage our customers to follow all applicable safety instructions, use fireworks in appropriate open spaces, and keep children supervised by responsible adults.
                        Our collection also includes products marketed as green or eco-friendly fireworks, where available, giving customers additional choices for more responsible celebrations.
                    </p>
                    <div className="flex items-center my-1 w-full max-w-2xl">
                        <div className="flex-grow border-t border-orange-500/20"></div>
                        <span className="mx-4 text-orange-500/100 text-lg">★</span>
                        <div className="flex-grow border-t border-orange-500/20"></div>
                    </div>

                    
                    <h4 className="text-gray-700 text-sm md:text-lg font-semibold mt-6">  
                       Best Discounted Prices & Festive Offers
                    </h4>

                     <p className="text-medium md:text-base leading-relaxed font-normal mt-3 border-l-2 border-orange-500/100 pl-4 c max-w-8xl">
                       By cutting out middleman layers, we bring you first-class items straight from premium manufacturing hubs at direct factory prices—saving you money on every box. We also offer convenient one-stop destination for your Diwali and festive fireworks needs with attractive deals.Customer are encouraged to explore our festive offers and curated combos, perfect for families, community events, or custom gift hampers.
                    </p>
                    <div className="flex items-center my-1 w-full max-w-2xl">
                        <div className="flex-grow border-t border-orange-500/20"></div>
                        <span className="mx-4 text-orange-500/100 text-lg">★</span>
                        <div className="flex-grow border-t border-orange-500/20"></div>
                    </div>

                   
                </div>

                              {/* INTERACTIVE FIREWORKS SAFETY BOARD: DO'S & DON'T'S TOGGLE PANEL */}
                <div className="w-full bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-xs mb-16 text-left relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-black  tracking-tight flex items-center gap-2">
                                <span>🔒</span> Fireworks Safety Tips
                            </h2>
                            <p className="text-gray-400 font-medium text-xs">
                                Your safety is our absolute standard. Please review our celebration guidelines.
                            </p>
                        </div>

                        {/* Interactive Segmented Tab Controls */}
                        <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-auto shadow-inner">
                            <button
                                type="button"
                                onClick={() => setSafetyTab("dos")}
                                className={`px-4 py-2 text-normal font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer select-none ${
                                    safetyTab === "dos"
                                        ? "bg-emerald-600 text-white shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                ✅ The Do's
                            </button>
                            <button
                                type="button"
                                onClick={() => setSafetyTab("donts")}
                                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer select-none ${
                                    safetyTab === "donts"
                                        ? "bg-red-600 text-white shadow-xs"
                                        : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                ❌ The Don't's
                            </button>
                        </div>
                    </div>

                    {/* CONTENT TRACK A: The Safety Do's Tab Frame */}
                    {safetyTab === "dos" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            {[
                                { t: "Read Instructions First", d: "Always read all manufacturer rules and specific product warning labels printed on each box before lighting up." },
                                { t: "Light Strictly Outdoors", d: "Always ignite items in wide-open, clear outdoor fields far away from dry grasses, trees, or overhead wires." },
                                { t: "Keep Water & Sand Handy", d: "Maintain a full bucket of clean water, a loose sand trough, or a working hose nearby to extinguish spent items safely." },
                                { t: "Adult Supervision Always", d: "Ensure young children are closely supervised by responsible adults at all times when handling sparklers or chakkars." },
                                { t: "Dispose of Spent Items Properly", d: "After use, soak all spent fireworks in water before discarding them in a safe trash container." },
                                { t: "Observe Local Laws and Regulations", d: "Always check and comply with local laws and regulations regarding the purchase, possession, and use of fireworks." },
                                { t: "Maintain a Safe Distance", d: "Keep a safe distance from the fireworks after lighting them, and ensure spectators are at a safe distance as well." },
                                { t: "Use a Long Lighter or an agarbathi", d: "Always use a long lighter or agarbathito ignite fireworks, keeping your hands and face away from the ignition point." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3 bg-emerald-50/40 border border-emerald-100/60 p-4 rounded-2xl transition-all hover:bg-emerald-50/70">
                                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 shadow-3xs mt-0.5">
                                        ✓
                                    </span>
                                    <div className="space-y-0.5">
                                        <h4 className="font-extrabold text-gray-700 text-medium tracking-tight">{item.t}</h4>
                                        <p className="text-gray-400 font-medium text-xs leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CONTENT TRACK B: The Safety Don't's Tab Frame */}
                    {safetyTab === "donts" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            {[
                                { t: "Never Relight Misfires", d: "If a rocket or shot fails to ignite, do not approach it. Wait 15 minutes, then submerge it completely inside a bucket of water." },
                                { t: "Never Ignite in Hand", d: "Never ignite fireworks inside your hands. Place cracker items firmly down on flat concrete terrain surfaces before lighting sparks." },
                                { t: "Never Wear Loose Clothing", d: "Avoid wearing loose hanging garments, silk clothes, or highly flammable synthetic fabrics when celebrating." },
                                { t: "Never Store Near Open Heat", d: "Never store leftover cracker stocks near kitchen spaces, open incense sticks, light points, or high temperature rooms." },
                                { t: "Never Use Alcohol or Drugs", d: "Never consume alcohol or recreational drugs before or during the handling of fireworks, as it impairs judgment and coordination." },
                                { t: "Never Point at People or Animals", d: "Never aim or throw fireworks at people, pets, or animals. Always ensure a clear area before igniting." },
                                { t: "Never Use Indoors", d: "Never use fireworks inside homes, garages, tents, or any enclosed spaces. Always use them outdoors in open areas." },
                                { t: "Never Leave Fireworks Unattended", d: "Never leave fireworks unattended, especially around children or pets. Always keep them under close supervision." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-3 bg-red-50/40 border border-red-100/60 p-4 rounded-2xl transition-all hover:bg-red-50/70">
                                    <span className="w-6 h-6 rounded-lg bg-red-600 text-white text-xs font-bold font-mono flex items-center justify-center shrink-0 shadow-3xs mt-0.5">
                                        ✕
                                    </span>
                                    <div className="space-y-0.5">
                                        <h4 className="font-extrabold text-gray-700 text-medium tracking-tight">{item.t}</h4>
                                        <p className="text-gray-400 font-medium text-xs leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

               
            {/* SECTION D: Closing Commitment Footer Callout */}
                <div className="bg-orange-500 text-white max-w-6xl rounded-2xl p-8 md:p-10 text-center  relative overflow-hidden shadow-sm">
                    {/* Abstract design vector watermarks */}
                
                    <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
                        <h2 className="text-xl md:text-2xl font-white tracking-tight">
                            Your Celebration, Our Commitment
                        </h2>
                        <div className="w-12 h-0.5 bg-white/40 rounded-full" />
                        <p className="text-medium md:text-base w-full font-normal mt-3 leading-relaxed max-w-4xl">
                            As per 2018 Supreme Court Order, Online Sale of Firecrackers are NOT permitted. We Value our customers and at the same time, we respect the jurisdiction. We request our customers to Select Your Products in Cart Page to see your Estimation and Submit the required crackers through the Submit Enquiry Button. We will contact you within a few hours and Confirm the Order through Phone Call and Email notifications. Please Add and Submit Your enquiries and enjoy your celebrations with KanSan crackers. KanSan Crackers is a shop following 100% legal & statutory compliances as per the explosive acts. Our License Name: ***** Licence No is ****. We send the parcels through registered and legal transport service providers as like every other major Companies in Sivakasi is doing so.
                        </p>
                        <strong className="text-xs uppercase tracking-widest font-black bg-white/10 px-4 py-1.5 rounded-full mt-4 border border-white/10 inline-block shadow-3xs animate-pulse">
                            🎇 KanSan Crackers - Lights Up the Celebrations!
                        </strong>
                    </div>
                </div>

            </div>

            {/* Floating Quick Shop Navigation Controls & Footer elements */}
            <FloatingCartButton />
            <Footer />
        </div>
    );
};

export default AboutUsPage;
