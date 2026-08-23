"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";

const ProductPreviewBlock = ({ productData, hideCheckoutButtons = false }) => {
    const { router, addToCart, currency } = useAppContext();
    const [mainImage, setMainImage] = useState(null);

    // Reset the main image whenever a different product is selected
    useEffect(() => {
        setMainImage(null);
    }, [productData]);

    if (!productData) return null;

    const baseImage = Array.isArray(productData.image) ? productData.image[0] : productData.image;
    const imageGallery = Array.isArray(productData.image) ? productData.image : [productData.image];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column: Image Galleries */}
            <div className="w-full">
                <div className="rounded-xl overflow-hidden bg-gray-500/10 mb-4 aspect-video flex items-center justify-center p-4">
                    <Image
                        src={mainImage || baseImage}
                        alt={productData.name || "Product Image"}
                        className="w-full h-full object-contain mix-blend-multiply"
                        width={600}
                        height={400}
                        priority
                    />
                </div>

                <div className="grid grid-cols-4 gap-3">
                    {imageGallery.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(image)}
                            className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 border-2 transition-all aspect-square flex items-center justify-center p-1 ${
                                (mainImage === image || (!mainImage && index === 0)) ? "border-orange-500 bg-white" : "border-transparent"
                            }`}
                        >
                            <Image
                                src={image}
                                alt="Gallery Thumbnail"
                                className="w-full h-full object-contain mix-blend-multiply"
                                width={120}
                                height={120}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Product Metadata & Details */}
            <div className="flex flex-col text-sm text-gray-600">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                    {productData.name}
                </h1>
                {/*
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                        <Image className="h-4 w-4" src={assets.star_icon} alt="star" width={16} height={16} />
                        <Image className="h-4 w-4" src={assets.star_icon} alt="star" width={16} height={16} />
                        <Image className="h-4 w-4" src={assets.star_icon} alt="star" width={16} height={16} />
                        <Image className="h-4 w-4" src={assets.star_icon} alt="star" width={16} height={16} />
                        <Image className="h-4 w-4" src={assets.star_dull_icon} alt="star dull" width={16} height={16} />
                    </div>
                    <p className="text-gray-500 font-semibold">(4.5)</p>
                </div>*/}

                <p className="text-gray-600 leading-relaxed font-medium">
                    {productData.description}
                </p>

                <p className="text-2xl font-black text-gray-900 mt-6 flex items-baseline gap-2">
                    {currency || "$"}{productData.offerPrice}
                    <span className="text-sm font-normal text-gray-400 line-through">
                        {currency || "$"}{productData.price}
                    </span>
                </p>

                <hr className="border-gray-200 my-6" />

                <div className="overflow-x-auto">
                    <table className="table-auto border-collapse w-full max-w-xs text-xs font-semibold text-gray-500">
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Brand</td>
                                <td className="py-2 text-gray-900">Generic</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Color</td>
                                <td className="py-2 text-gray-900">Multi</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-bold text-gray-400 uppercase tracking-wider">Category</td>
                                <td className="py-2 text-gray-900 capitalize">{productData.category}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* FIXED CONDITION: Conditionally displays transaction buttons depending on modal views */}
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
                            onClick={() => { addToCart(productData._id); router.push('/cart') }} 
                            className="w-full sm:w-1/2 py-3.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 active:bg-orange-800 transition cursor-pointer text-center shadow-xs"
                        >
                            Buy Now
                        </button>
                    </div>
                ) : (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-xs text-orange-800 font-bold tracking-wide mt-8 leading-relaxed shadow-3xs">
                        💡 Information: To purchase this item, close this preview card window and input your target quantity directly into the Quick Shop row layout grid cells.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductPreviewBlock;
