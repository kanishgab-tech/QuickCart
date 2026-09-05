'use client'
import { useState, useEffect, Suspense,useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import { useAppContext } from "@/context/AppContext";
import { PRODUCT_CATEGORIES } from "@/assets/assets";
import FloatingCartButton from "@/components/FloatingCartButton";

const AllProductsContent = () => {
    const { products } = useAppContext();
    const searchParams = useSearchParams();
    const router = useRouter();
    const sidebarRef = useRef(null); 
    
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All"); 
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Sync parameters on routing changes
    useEffect(() => {
        const queryCategory = searchParams.get("category");
        setSelectedCategory(queryCategory ? decodeURIComponent(queryCategory) : "All");

        const queryBrand = searchParams.get("brand");
        setSelectedBrand(queryBrand ? decodeURIComponent(queryBrand) : "All");
    }, [searchParams]);

    // Click outside drawer monitoring
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileFilterOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsMobileFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobileFilterOpen]);

    const categories = ["All", ...PRODUCT_CATEGORIES];
    const brands = ["All", ...new Set(products ? products.map(p => p.brand).filter(Boolean) : [])];

    const filteredProducts = products ? products.filter(product => {
        if (product.isActive === false) return false;
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesBrand = selectedBrand === "All" || product.brand?.toLowerCase() === selectedBrand.toLowerCase();
        return matchesCategory && matchesBrand;
    }) : [];

    const handleClearFilters = () => {
        setSelectedCategory("All");
        setSelectedBrand("All");
        setIsMobileFilterOpen(false); 
        router.push('/all-products');
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-6 pb-14 w-full items-start relative">
            
            {/* FIXED NEW PLACEMENT: Pinned left-edge tab containing a prominent Right Arrow icon. Visible all the time on mobile scroll. */}
            <div className="md:hidden fixed left-0 top-[45%] -translate-y-1/2 z-40">
                <button
                    type="button"
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex flex-col items-center gap-.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-r-2xl shadow-lg pl-3 pr-2 py-4 active:scale-95 transition-all cursor-pointer border border-l-0 border-orange-500/20 select-none group vertical-text"
                    title="Show Filters"
                >
                   {/* <span className="text-[10px] tracking-widest uppercase writing-mode-vertical">Filters</span>*/}
                    {/* Fixed Right Arrow indicator asset element */}
                    <span className="text-sm font-bold mt-0.7 group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
            </div>

            {/* Backdrop Mask */}
            {isMobileFilterOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity duration-300"
                    onClick={() => setIsMobileFilterOpen(false)} 
                />
            )}

            {/* Slide-Out Left Drawer Panel Container */}
            <aside
            ref={sidebarRef}
                
                className={`w-[280px] md:w-64 shrink-0 pb-6 md:pb-0 
                    fixed md:sticky top-[112px] md:top-4 bottom-0 left-0 bg-white md:bg-transparent z-40 md:z-10 p-6 md:p-0 shadow-2xl md:shadow-none border-r border-gray-200 h-[calc(100vh-112px)] md:h-auto overflow-y-auto transition-all duration-300 ease-out transform
                    ${isMobileFilterOpen ? "translate-x-0 opacity-100" : "max-md:-translate-x-full max-md:opacity-0 md:block"}
                    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-orange-50/50 [&::-webkit-scrollbar-thumb]:bg-orange-500 [&::-webkit-scrollbar-thumb]:rounded-full`}
            >
                {/* Mobile Close Button Header Row panel */}
                <div className="flex md:hidden items-center justify-between border-b border-gray-100 pb-3 mb-5">
                    <p className="font-black text-gray-750  tracking-tight text-xl">Our Products</p>
                    <button 
                        type="button" 
                        onClick={() => setIsMobileFilterOpen(false)}
                        className="text-gray-500 hover:text-gray-700 text-sm font-bold p-1 cursor-pointer"
                    >
                        ✕ Close
                    </button>
                </div>

                {/* Clear Filter Action Button
                {(selectedCategory !== "All" || selectedBrand !== "All") && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="w-full mb-5 text-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 hover:bg-red-100 transition cursor-pointer"
                    >
                        ❌ Clear Active Filters
                    </button>
                )} */}

                {/* Section A: Category List */}
                <div className="mb-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-1">Filter By Category</p>
                    <ul className="space-y-1">
                        {categories.map((category) => (
                            <li key={category}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setIsMobileFilterOpen(false); 
                                        const params = new URLSearchParams(window.location.search);
                                        if (category === "All") params.delete("category");
                                        else params.set("category", category);
                                        router.push(`/all-products?${params.toString()}`);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-normal transition-all cursor-pointer ${
                                        selectedCategory === category
                                            ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600 pl-2 font-bold shadow-3xs"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {category === "All" ? "All Categories" : category}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Section B: Brand List */}
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-1">Filter By Brand</p>
                    <ul className="space-y-1">
                        {brands.map((brand) => (
                            <li key={brand}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedBrand(brand);
                                        setIsMobileFilterOpen(false); 
                                        const params = new URLSearchParams(window.location.search);
                                        if (brand === "All") params.delete("brand");
                                        else params.set("brand", brand);
                                        router.push(`/all-products?${params.toString()}`);
                                    }}
                                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-normal transition-all cursor-pointer capitalize ${
                                        selectedBrand.toLowerCase() === brand.toLowerCase()
                                            ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600 pl-2 font-bold shadow-3xs"
                                            : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                >
                                    {brand === "All" ? "All Brands" : brand}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Product Display Canvas Grid */}
            <main className="flex-grow w-full">
                {/* Visual context status tracker info line with integrated inline 'Clear Filter' action */}
                <div className="mb-5 text-xs font-semibold text-gray-600 flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200/60 rounded-xl p-3 shadow-3xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span> {filteredProducts.length} items</span>
                        <span className="text-gray-800 bg-white border border-gray-200 px-3 py-0.5 rounded-md font-semibold capitalize">Category: {selectedCategory}</span>
                        <span className="text-gray-300 font-normal">&times;</span>
                        <span className="text-gray-800 bg-white border border-gray-200 px-3 py-0.5 rounded-md font-semibold capitalize">Brand: {selectedBrand}</span>
                        {/* Inline Clear Trigger Button: Reveals itself dynamically next to indicators */}
                    {(selectedCategory !== "All" || selectedBrand !== "All") && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-[11px] font-black text-gray-600 bg-yellow-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1 select-none"
                        >
                            <span>✖️</span> Clear Filters
   

                        </button>
                    )}
                    </div>

                
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-xl border border-gray-200 p-6 shadow-3xs animate-fade-in">
                        No active products found matching the combined filter parameters.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center gap-6 w-full">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

// 2. PRIMARY MASTER PAGE COMPONENT EXPORT WRAPPER
const AllProducts = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50">
            <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-2xs">
                <Navbar />
            </div>
               <div className="sticky top-[64px] z-40 bg-white border-b border-gray-200/60 shadow-3xs">
                <Titlebar />
            </div>
           
            
            <div className="flex flex-col px-6 md:px-16 lg:px-32 flex-grow">
                <div className="flex flex-col items-start pt-12">
                    <p className="text-2xl font-semibold text-gray-900 tracking-tight">Our Products</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1.5"></div>
                </div>

                {/* Enclosing dynamic content inside a clean boundary container blocks compiler exceptions */}
                <Suspense fallback={
                    <div className="p-20 text-center text-xs font-semibold text-gray-400 animate-pulse">
                        Loading active storefront catalogs...
                    </div>
                }>  
                    <AllProductsContent />
                </Suspense>
                
            </div>
              <FloatingCartButton/>
            
            <Footer />
        </div>
    );
};

export default AllProducts;
