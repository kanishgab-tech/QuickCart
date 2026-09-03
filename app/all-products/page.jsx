'use client'
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import { useAppContext } from "@/context/AppContext";
import { PRODUCT_CATEGORIES } from "@/assets/assets";
import FloatingCartButton from "@/components/FloatingCartButton";

// 1. ISOLATE FILTER LIFECYCLE LOGIC INTO A NEW CHILD INNER CONTAINER WORKSPACE
const AllProductsContent = () => {
    const { products } = useAppContext();
    const searchParams = useSearchParams();
    const router = useRouter();
    
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All"); // FIXED: Track active brand filtering parameters

    // Listen to URL routing parameter updates reactively for both Category and Brand routes
    useEffect(() => {
        const queryCategory = searchParams.get("category");
        if (queryCategory) {
            setSelectedCategory(decodeURIComponent(queryCategory));
        } else {
            setSelectedCategory("All");
        }

        const queryBrand = searchParams.get("brand");
        if (queryBrand) {
            setSelectedBrand(decodeURIComponent(queryBrand));
        } else {
            setSelectedBrand("All");
        }
    }, [searchParams]);

    const categories = ["All", ...PRODUCT_CATEGORIES];

    // FIXED: Dynamically map and build an aggregate unique list of brands available across active inventory lines
    const brands = ["All", ...new Set(products ? products.map(p => p.brand).filter(Boolean) : [])];

    // Reactive Dual-Dimensional Filtering Pipeline
    const filteredProducts = products ? products.filter(product => {
        if (product.isActive === false) return false;
        
        // Match conditions across both independent filter selections simultaneously
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesBrand = selectedBrand === "All" || product.brand?.toLowerCase() === selectedBrand.toLowerCase();
        
        return matchesCategory && matchesBrand;
    }) : [];

    // Helper logic to clear filters and clear the browser parameter strings cleanly
    const handleClearFilters = () => {
        setSelectedCategory("All");
        setSelectedBrand("All");
        router.push('/all-products');
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-8 pb-14 w-full items-start">
            {/* Desktop Sidebar Panel Container - Holds both Categories and Brands tracking list filters */}
            <aside className="w-full md:w-64 shrink-0 md:sticky md:top-4 max-h-[85vh] overflow-y-auto pr-2 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-orange-50/50 
                [&::-webkit-scrollbar-thumb]:bg-orange-500 
                [&::-webkit-scrollbar-thumb]:rounded-full">
                
                {/* Clear Active State Action badge element */}
                {(selectedCategory !== "All" || selectedBrand !== "All") && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="w-full mb-5 text-center text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg py-2 hover:bg-red-100 transition cursor-pointer"
                    >
                        ❌ Clear Active Filters
                    </button>
                )}

                {/* Section A: Category Listings filter row stack */}
                <div className="mb-6">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-1">Filter By Category</p>
                    <ul className="space-y-1">
                        {categories.map((category) => (
                            <li key={category}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        // Update the browser URL query cleanly while maintaining active brand status state layers
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

                {/* FIXED NEW ADDITION -> Section B: Brand Listings filter row stack */}
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5 px-1">Filter By Brand</p>
                    <ul className="space-y-1">
                        {brands.map((brand) => (
                            <li key={brand}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedBrand(brand);
                                        // Update the browser URL query cleanly while maintaining active category status state layers
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
                {/* Visual context status tracker info line */}
                <div className="mb-4 text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                    <span>🔍 Found {filteredProducts.length} items matching:</span>
                    <span className="text-gray-800 bg-gray-100 border px-1.5 py-0.5 rounded capitalize">{selectedCategory}</span>
                    <span>&times;</span>
                    <span className="text-gray-800 bg-gray-100 border px-1.5 py-0.5 rounded capitalize">{selectedBrand}</span>
                        {/* FIXED NEW PLACEMENT: Inlines the clear trigger button cleanly next to status criteria texts */}
                    {(selectedCategory !== "All" || selectedBrand !== "All") && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-[11px] font-black text-gray-700 bg-orange-50 hover:bg-gray-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95 shrink-0 flex items-center gap-1 select-none"
                        >
                            <span>❌</span> Clear Filters
                        </button>
                    )}
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
            <Navbar />
            <Titlebar />
            
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
