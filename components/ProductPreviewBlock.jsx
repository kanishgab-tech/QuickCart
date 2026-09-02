'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets"; 

// --- STEP 1: ISOLATED SUB-COMPONENT FOR SINGLE THUMBNAIL TRACKING (Declared outside to prevent re-creation crashes) ---
const GalleryItem = ({ image, index, mainImage, setMainImage, assets }) => {
    // Localized error state isolated specifically to this single grid square slot
    const [itemError, setItemError] = useState(false);

    // Safe fallback calculation logic using the item's specific scoped image prop
    const isUrlValid = !itemError && typeof image === "string" && image.trim() !== "";
    const finalThumbnailSrc = isUrlValid ? image.trim() : assets.box_icon;

    return (
        <div 
            onClick={() => !itemError && setMainImage(image)} 
            className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border-2 transition-all aspect-square flex items-center justify-center p-1 ${ 
                itemError ? "opacity-60 cursor-not-allowed border-gray-200" : 
                (mainImage === image || (!mainImage && index === 0)) 
                    ? "border-orange-500 bg-white shadow-3xs" 
                    : "border-transparent hover:border-gray-300" 
            }`}
        > 
            <Image 
                src={finalThumbnailSrc} 
                alt={`Gallery Thumbnail ${index + 1}`} 
                className="w-full h-full object-contain mix-blend-multiply select-none" 
                width={120} 
                height={120} 
                unoptimized={typeof finalThumbnailSrc === 'string'} 
                onError={() => { 
                    console.warn(`Gallery item image failing at index position: [${index}]`); 
                    setItemError(true); 
                }} 
            /> 
        </div>
    );
};

// --- MAIN MASTER VIEW BLOCK ---
const ProductPreviewBlock = ({ productData, hideCheckoutButtons = false }) => {
    const { router, addToCart, currency } = useAppContext();
    const [mainImage, setMainImage] = useState(null);

    // Reset the main image whenever a different product is selected
    useEffect(() => {
        setMainImage(null);
    }, [productData]);

    if (!productData) return null;

    // Safely extract image gallery array from product parameters
    const imageGallery = Array.isArray(productData.image) ? productData.image : [productData.image];

    return (
        <div className="flex flex-col md:flex-row gap-10 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs">
            {/* Left Column: Image Gallery Visuals Workspace */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Master Gallery Display Frame */}
                <div className="w-full h-80 md:h-[400px] rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden p-4">
                    <Image
                        src={mainImage || imageGallery[0] || assets.box_icon}
                        alt={productData.name}
                        className="max-w-full max-h-full object-contain mix-blend-multiply"
                        width={500}
                        height={500}
                        unoptimized={true}
                    />
                </div>

                {/* STEP 2: THUMBNAILS GRID CONTAINER */}
                <div className="grid grid-cols-4 gap-3">
                    {imageGallery && imageGallery.length > 0 && imageGallery[0] !== "" ? (
                        imageGallery.map((image, index) => (
                            <GalleryItem
                                key={index}
                                image={image}
                                index={index}
                                mainImage={mainImage || imageGallery[0]}
                                setMainImage={setMainImage}
                                assets={assets}
                            />
                        ))
                    ) : (
                        <div className="col-span-4 cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border border-transparent aspect-square flex items-center justify-center p-1">
                            <Image
                                src={assets.box_icon}
                                alt="No Images Available"
                                className="w-12 h-12 object-contain opacity-40"
                                width={120}
                                height={120}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Product Metadata & Details Layout */}
            <div className="flex-1 flex flex-col text-sm text-gray-600">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                    {productData.name}
                </h1>
                
                <p className="text-gray-600 leading-relaxed font-medium mt-2">
                    {productData.description}
                </p>

                <p className="text-2xl font-black text-gray-900 mt-6 flex items-baseline gap-2">
                    {currency || "₹"}{(productData.offerPrice || 0).toLocaleString('en-IN')}
                    {Number(productData.offerPrice) < Number(productData.price) && (
                        <span className="text-sm font-normal text-gray-400 line-through">
                            {currency || "₹"}{(productData.price || 0).toLocaleString('en-IN')}
                        </span>
                    )}
                </p>

                <hr className="border-gray-200 my-6" />

                <div className="overflow-x-auto">
                    <table className="table-auto border-collapse w-full max-w-xs text-xs font-semibold text-gray-500">
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Product Code</td>
                                <td className="py-2 text-gray-700 font-mono font-bold text-orange-600">{productData.productCode || "NA"}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Brand</td>
                                <td className="py-2 text-gray-700">{productData.brand || "Generic"}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Size</td>
                                <td className="py-2 text-gray-700">{productData.size || "Free Size"}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Color</td>
                                <td className="py-2 text-gray-700">Multi</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Category</td>
                                <td className="py-2 text-gray-700 capitalize">{productData.category}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Conditional Transaction Button Blocks */}
                {!hideCheckoutButtons ? (
                    <div className="flex flex-col sm:flex-row items-center mt-8 gap-4 w-full">
                        <button 
                            type="button" 
                            onClick={() => addToCart(productData._id)} 
                            className="w-full sm:w-1/2 py-3.5 border-2 border-orange-600 text-orange-600 font-bold rounded-xl hover:bg-orange-50 active:bg-orange-100 transition cursor-pointer text-center"
                        >
                            Add to Cart
                        </button>
                        <button 
                            type="button" 
                            onClick={() => { addToCart(productData._id); router.push('/cart'); }} 
                            className="w-full sm:w-1/2 py-3.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 active:bg-orange-800 transition cursor-pointer text-center shadow-xs"
                        >
                            Buy Now
                        </button>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-xs text-orange-800 font-bold tracking-wide mt-8 leading-relaxed shadow-3xs">
                        💡 Information: To purchase this item, close this preview window and input your target quantity directly into the Quick Shop row layout grid cells.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPreviewBlock;
