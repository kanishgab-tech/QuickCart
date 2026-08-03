'use client'
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Titlebar from "@/components/Titlebar";
import { useAppContext } from "@/context/AppContext";

const AllProducts = () => {
    const { products } = useAppContext();
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Extract unique categories dynamically from products array
    const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

    // Filter products based on active selection
    const filteredProducts = selectedCategory === "All" 
        ? products 
        : products.filter(product => product.category === selectedCategory);

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <Titlebar />
            
            <div className="flex flex-col px-6 md:px-16 lg:px-32 flex-grow">
                {/* Heading Area */}
                <div className="flex flex-col items-start pt-12">
                    <p className="text-2xl font-medium">All products</p>
                    <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                </div>

                {/* Main Content Layout Container */}
                <div className="flex flex-col md:flex-row gap-8 mt-12 pb-14 w-full items-start">
                    
                    {/* Left Side Category Filter Panel */}
                    <aside className="w-full md:w-64 shrink-0 md:sticky md:top-4 max-h-[70vh] overflow-y-auto pr-2 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Categories</h3>
                        <ul className="space-y-2">
                            {categories.map((category) => (
                                <li key={category}>
                                    <button
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-all ${
                                            selectedCategory === category
                                                ? "bg-orange-50 text-orange-600 border-l-4 border-orange-600 pl-2"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`}
                                    >
                                        {category}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Right Side Product Grid */}
                    <main className="flex-grow w-full">
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                No products found in this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center gap-6 w-full">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={product.id || index} product={product} />
                                ))}
                            </div>
                        )}
                    </main>

                </div>
            </div>
            
            <Footer />
        </div>
    );
};

export default AllProducts;