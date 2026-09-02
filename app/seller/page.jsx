'use client'
import React, { useState } from "react";
import { assets,PRODUCT_CATEGORIES } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";

const AddProduct = () => {

  const { getToken } = useAppContext();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Earphone');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [productCode, setProductCode] = useState('');

  // New States: Initialized to business logic rules
  const [isActive, setIsActive] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  const [stock, setStock] = useState('');
  const [brand, setBrand] = useState('');
  const [size, setSize] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission if offer price is configured upside down
    if (Number(offerPrice) > Number(price)) {
      toast.error('Offer price cannot be greater than the original product price.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('productCode', productCode.trim().toUpperCase());
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('offerPrice', offerPrice);
    formData.append('stock', stock);
    formData.append('brand', brand.trim() || 'Generic');
    formData.append('size', size.trim() || 'Free Size');
    // NEW: Appending visibility and featured attributes safely as string tokens
    formData.append('isActive', isActive ? "true" : "false");
    formData.append('isPopular', isPopular ? "true" : "false");

    for (let i = 0; i < files.length; i++) {
      if (files[i]) {
        formData.append('images', files[i]);
      }
    }
    
    try {
      const token = await getToken();
      if (!token) {
        toast.error('Unable to get auth token. Please sign in again.');
        return;
      }

      const { data } = await axios.post('/api/product/add', formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (data.success) {
        toast.success(data.message);
        setFiles([]);
        setName('');
        setProductCode('');
        setDescription('');
        setCategory('Earphone');
        setPrice('');
        setOfferPrice('');
        setIsActive(true); // Reset flag tracking values back to initial defaults
        setIsPopular(false);
        setStock('');
        setBrand('');
        setSize('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error?.response?.data?.message || 'An error occurred while adding the product.');
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        
        {/* Product Image Section */}
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[...Array(4)].map((_, index) => (
              <label key={index} htmlFor={`image${index}`}>
                <input 
                  onChange={(e) => {
                    const updatedFiles = [...files];
                    updatedFiles[index] = e.target.files[0];
                    setFiles(updatedFiles);
                  }} 
                  type="file" 
                  id={`image${index}`} 
                  accept="image/*"
                  hidden 
                />
                <Image
                  className="max-w-24 cursor-pointer border border-gray-200 rounded p-1 hover:border-orange-500 transition-colors"
                  src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area}
                  alt="Upload slot"
                  width={100}
                  height={100}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Product Name Input */}
        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name<span className="text-red-500">*</span>
          </label>
          <input
            id="product-name"
            type="text"
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-orange-500 transition-colors"
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-gray-500 font-semibold text-xs uppercase tracking-wider block" htmlFor="productCode">
              Product Code <span className="text-red-500">*</span>
          </label>
          <input
              id="productCode"
              type="text"
              required
              placeholder="e.g. CHAK-01, SPARK-05"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-orange-500"
              onChange={(e) => setProductCode(e.target.value)}
              value={productCode}
          />
      </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full text-xs font-semibold text-gray-500">
        {/* Optional Brand Input Box */}
        <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-base font-medium" htmlFor="brand">Brand (Optional)</label>
            <input
                id="brand" type="text" placeholder="e.g. Nike, Apple, Puma"
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-800 font-medium focus:outline-none focus:border-orange-500 bg-gray-50/50"
                onChange={(e) => setBrand(e.target.value)}
                value={brand}
            />
        </div>

      {/* Optional Size Input Box */}
      <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-base font-medium" htmlFor="size">Size Details (Optional)</label>
              <input
                  id="size" type="text" placeholder="e.g. S, M, L, XL, 6.1-inch"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-xs text-gray-800 font-medium focus:outline-none focus:border-orange-500 bg-gray-50/50"
                  onChange={(e) => setSize(e.target.value)}
                  value={size}
              />
          </div>
      </div>

        {/* Product Description Textarea */}
        <div className="flex flex-col gap-1 max-w-md">
          <div className="flex items-center justify-between">
            <label className="text-base font-medium" htmlFor="product-description">
              Product Description<span className="text-red-500">*</span>
            </label>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              description.length >= 450 ? "bg-red-50 text-red-600 border-red-200" : "bg-gray-50 text-gray-400 border-gray-200"
            }`}>
              {100 - description.length} characters remaining
            </span>
          </div>
          <textarea
            id="product-description"
            rows={4}
            maxLength={100}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-y focus:border-orange-500 transition-colors min-h-[100px]"
            placeholder="Type here"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            required
          ></textarea>
        </div>

        {/* Categories & Price Configuration Rows */}
        <div className="flex items-center gap-5 flex-wrap">
        <div className="flex flex-col gap-1 w-32">
          <label className="text-base font-medium" htmlFor="category">
            Category<span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 cursor-pointer focus:border-orange-500"
            onChange={(e) => setCategory(e.target.value)}
            value={category}
          >
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
          
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price<span className="text-red-500">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-orange-500"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div>

          
          <div className="flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price<span className="text-red-500">*</span>
            </label>
            <input
              id="offer-price"
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              className={`outline-none md:py-2.5 py-2 px-3 rounded border transition-colors ${
                price && offerPrice && Number(offerPrice) > Number(price)
                  ? "border-red-500 bg-red-50 text-red-900 focus:border-red-600"
                  : "border-gray-500/40 focus:border-orange-500"
              }`}
              onChange={(e) => setOfferPrice(e.target.value)}
              value={offerPrice}
              required
            />
          </div>
        </div>
    <div className="flex flex-col gap-1 w-32">
      <label className="text-base font-medium" htmlFor="stock">Inventory Stock</label>
      <input
          id="stock" type="number" placeholder="100" min="0" required
          className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 focus:border-orange-500"
          onChange={(e) => setStock(e.target.value)}
          value={stock}
            />
      </div>

        {/* Real-time Pricing Mismatch Warning Callout */}
        {price && offerPrice && Number(offerPrice) > Number(price) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-xs text-red-700 font-medium max-w-md animate-fade-in">
            <span>⚠️</span>
            <p>The offer price cannot be set higher than your original product price.</p>
          </div>
        )}

        {/* NEW SETTINGS LAYOUT ROW: Toggle Switches */}
        <div className="flex items-center gap-6 pt-2 bg-gray-50 p-4 rounded-xl border border-gray-200 max-w-md">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none">
            <input 
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
            />
            <div className="flex flex-col">
              <span>List Instantly</span>
              <span className="text-[10px] text-gray-400 font-normal">Visible to shoppers right away</span>
            </div>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none border-l border-gray-300 pl-6">
            <input 
              type="checkbox"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
            />
            <div className="flex flex-col">
              <span>Feature on Home</span>
              <span className="text-[10px] text-gray-400 font-normal">Add to popular product slots</span>
            </div>
          </label>
        </div>

        {/* Action Controls Group Button */}
        <button type="submit"disabled={price && offerPrice && Number(offerPrice) > Number(price)}className="px-10 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded shadow-xs transition-colors cursor-pointer text-sm">
          ADD
          </button>
      </form>
      {/* <Footer /> */}
    </div>
  );};

export default AddProduct;