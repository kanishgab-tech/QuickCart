'use client'
import { useState, useEffect, Suspense } from "react"; // FIXED: Injected Suspense hook destructuring
import { useSearchParams } from "next/navigation"; 
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import { useAppContext } from "@/context/AppContext";
import { PRODUCT_CATEGORIES } from "@/assets/assets";

// 1. ISOLATE FILTER LIFECYCLE LOGIC INTO A NEW CHILD INNER CONTAINER WORKSPACE
const AllProductsContent = () => {
    const { products } = useAppContext();
    const searchParams = useSearchParams(); // Safely called inside our nested Suspense vector boundary
    
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Listen to URL routing parameter updates reactively
    useEffect(() => {
        const queryCategory = searchParams.get("category");
        if (queryCategory) {
            setSelectedCategory(decodeURIComponent(queryCategory));
        }
    }, [searchParams]);

    const categories = ["All", ...PRODUCT_CATEGORIES];

    // Reactive Filtering Pipeline
    const filteredProducts = products ? products.filter(product => {
        if (product.isActive === false) return false;
        if (selectedCategory === "All") return true;
        return product.category === selectedCategory;
    }) : [];

    return (
        <div className="flex flex-col md:flex-row gap-8 mt-12 pb-14 w-full items-start">
            {/* Desktop Sidebar Panel Container */}
             <aside className="hidden md:block w-64 shrink-0 sticky top-4 max-h-[70vh] overflow-y-auto pr-2 border-r border-gray-200 pb-0 
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-orange-50/50 
        [&::-webkit-scrollbar-thumb]:bg-orange-500 
        [&::-webkit-scrollbar-thumb]:rounded-full">
        
        <ul className="space-y-1.5">
            {categories.map((category) => (
                <li key={category}>
                    <button
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-normal transition-all cursor-pointer ${
                            selectedCategory === category
                                ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600 pl-2 shadow-2xs font-bold"
                                : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        {category === "All" ? "All Categories" : category}
                    </button>
                </li>
            ))}
        </ul>
    </aside>

            {/* Product Display Canvas Grid */}
            <main className="flex-grow w-full">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 font-medium bg-white rounded-xl border p-6">
                        No active products found matching the selected category.
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

                {/* FIXED: Enclosing dynamic content inside a clean boundary container blocks compiler exceptions */}
                <Suspense fallback={
                    <div className="p-20 text-center text-xs font-semibold text-gray-400 animate-pulse">
                        Loading active storefront catalogs...
                    </div>
                }>
                    <AllProductsContent />
                </Suspense>

            </div>
            <Footer />
        </div>
    );
};

export default AllProducts;
