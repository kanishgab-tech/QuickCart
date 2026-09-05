"use client"
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Tittlebar from "@/components/Titlebar";
import Footer from "@/components/Footer";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import ProductPreviewBlock from "@/components/ProductPreviewBlock"; // NEW: Import the block

const Product = () => {
    const { id } = useParams();
    const { products } = useAppContext();
    const [productData, setProductData] = useState(null);
    const { router} = useAppContext();

    useEffect(() => {
        const product = products.find(p => p._id === id);
        setProductData(product);
    }, [id, products]);

    return productData ? (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <Tittlebar />
            <main className="px-6 md:px-16 lg:px-32 pt-14 space-y-16 flex-grow">
                {/* FIXED: Reusing the layout template passing hideCheckoutButtons=false for the full page view */}
                <ProductPreviewBlock productData={productData} hideCheckoutButtons={false} />

                {/* Featured Bottom Recommendation Grid Viewport */}
                <div className="flex flex-col items-center border-t border-gray-100 pt-12">
                    <div className="flex flex-col items-center mb-6">
                        <p className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                            Featured <span className="text-orange-600">Products</span>
                        </p>
                        <div className="w-16 h-0.5 bg-orange-600 mt-2 rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full justify-items-center">
                        {products.slice(0, 5).map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>
                    
                    <button onClick={() => { router.push('/all-products') }} 
                     className="px-8 py-2.5 mt-8 mb-16 border border-gray-300 bg-orange-600 rounded-xl text-xs font-normal text-white hover:bg-gray-400 transition cursor-pointer">
                        
                        See More Products
                        </button>
                </div>
            </main>

            <Footer />
        </div>
    ) : <Loading />
};

export default Product;
