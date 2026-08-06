'use client'
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading  from "@/components/Loading";
import { assets , PRODUCT_CATEGORIES } from "@/assets/assets";

const ProductList = () => {
  const { router, getToken, user, showToast } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  // Modal & Edit Lifecycle State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Local track for newly chosen images to upload to Cloudinary
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Reactive Product State Filtering Pipeline
const filteredProducts = products.filter((product) => {
  if (activeTab === "Active") return product.isActive !== false;
  if (activeTab === "Inactive") return product.isActive === false;
  return true; // "All"
});


// Quick inline handler to instantly reactivate a soft-deleted item
    const handleReactivateProduct = async (product) => {
      try {
        const token = await getToken();
        
        // FIXED: Constructing multi-part FormData instead of a JSON object string
        const formData = new FormData();
        formData.append("productId", product._id);
        formData.append("name", product.name);
        formData.append("description", product.description || "");
        formData.append("category", product.category);
        formData.append("price", product.price); 
        formData.append("offerPrice", product.offerPrice);
        formData.append("isPopular", product.isPopular ? "true" : "false");
        formData.append("existingImages", JSON.stringify(product.image));
        formData.append("isActive", "true"); // Forces state flag cleanly back to active status

        const { data } = await axios.post('/api/product/update', formData, { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' // Header matching backend requirements
          } 
        });

        if (data.success) {
          showToast("Product successfully reactivated!", "success");
          fetchSellerProduct(); // Re-sync table records
        } else {
          showToast(data.message, "error");
        }
      } catch (error) {
        showToast(error.response?.data?.message || error.message, "error");
      }
    };

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      if (!token) {
        showToast('Unable to get auth token. Please sign in again.', 'error');
        setLoading(false);
        return;
      }

      const { data } = await axios.get('/api/product/seller-list', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setProducts(data.products);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      console.error('Error fetching seller products', error);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSellerProduct();
    }   
  }, [user]);

  // Open the editor modal workspace populated with active product values
  const openEditModal = (product) => {
    setEditingProduct({ ...product });
    setSelectedImageFiles([]); // Reset local staging file arrays
    setIsEditModalOpen(true);
  };

  // Handle local image file selections
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImageFiles(prev => [...prev, ...files]);
  };

  // Remove existing Cloudinary image url from current product array staging track
  const removeExistingImage = (imgUrl) => {
    setEditingProduct(prev => ({
      ...prev,
      image: prev.image.filter(url => url !== imgUrl)
    }));
  };

  // Remove locally staged file before upload step
  const removeStagedFile = (index) => {
    setSelectedImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle Form Submission: Sends text and Multipart image assets directly to the backend
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (editingProduct.image.length === 0 && selectedImageFiles.length === 0) {
      showToast("A product must contain at least one image file context.", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      
      formData.append("productId", editingProduct._id);
      formData.append("name", editingProduct.name);
      formData.append("description", editingProduct.description || ""); 
      formData.append("category", editingProduct.category);
      formData.append("price", editingProduct.price); 
      formData.append("offerPrice", editingProduct.offerPrice);
      formData.append("isPopular", editingProduct.isPopular ? "true" : "false");
      formData.append("existingImages", JSON.stringify(editingProduct.image));

      selectedImageFiles.forEach((file) => {
        formData.append("newImages", file);
      });

      const { data } = await axios.post('/api/product/update', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        showToast("Product updated successfully!", "success");
        setIsEditModalOpen(false);
        fetchSellerProduct();
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || error.message, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

    // Action Handler to delete products (soft or hard) with guardian checks for active orders
  const handleProductStatusChange = async (productId, actionType) => {
    const confirmationPrompt = actionType === "hard-delete" 
      ? "PERMANENT DELETION WARNING:\nAre you absolutely certain you want to wipe this product from database tracks and erase its cloud images?" 
      : "Are you sure you want to deactivate (soft-delete) this product? It will instantly be hidden from standard shopper menus.";
      
    if (!window.confirm(confirmationPrompt)) return;

    try {
      const token = await getToken();
      const { data } = await axios.post('/api/product/delete', { productId, action: actionType }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        showToast(data.message, "success");
        
        if (actionType === "hard-delete") {
          // Splice completely out of client array map 
          setProducts(prev => prev.filter(p => p._id !== productId));
        } else {
          // Instantly toggle the active visibility flag inside local client memory mapping
          setProducts(prev => prev.map(p => p._id === productId ? { ...p, isActive: false } : p));
        }
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast(error.response?.data?.message || error.message, "error");
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50/50 relative">
      {loading ? <Loading /> : (
        <div className="w-full md:p-10 p-4 space-y-6">
          
          {/* Header Layout Component */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">All Products</h2>
              <p className="text-xs text-gray-500 mt-1">Manage catalog listings, modify metadata, or toggle visibility states.</p>
            </div>
          </div>

          {/* Quick Segment Status Filtering Tabs */}
          <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl max-w-xs border border-gray-200">
            {["All", "Active", "Inactive"].map((tab) => {
              const isSelected = activeTab === tab;
              // Calculate real-time counts for clear layout scannability
              const count = products.filter(p => {
                if (tab === "Active") return p.isActive !== false;
                if (tab === "Inactive") return p.isActive === false;
                return true;
              }).length;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 text-center py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-gray-900 shadow-xs border border-gray-100"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab} <span className={`ml-1 text-[10px] ${isSelected ? "text-orange-600 font-bold" : "text-gray-400"}`}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Table Container Matrix Viewport */}
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-xl bg-white border border-gray-200 shadow-xs">
            <table className="table-fixed w-full border-collapse">
              <thead className="text-gray-700 bg-gray-100/70 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-left">
                <tr>
                  <th className="w-2/5 px-6 py-4 font-semibold truncate">Product</th>
                  <th className="px-6 py-4 font-semibold truncate max-sm:hidden">Category</th>
                  <th className="px-6 py-4 font-semibold truncate w-24 text-right">Price</th>
                  <th className="px-6 py-4 font-semibold truncate w-56 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const isStale = product.isActive === false;
                    
                    return (
                      <tr key={product._id} className={`hover:bg-gray-50 transition-colors ${isStale ? "bg-gray-100/50" : ""}`}>
                        <td className="px-6 py-4 flex items-center space-x-3 truncate">
                          <div className="border border-gray-200 bg-white rounded p-1 shrink-0 w-12 h-12 flex items-center justify-center overflow-hidden relative">
                            <img
                              src={product.image && product.image.length > 0 ? product.image[0] : assets.box_icon}
                              alt={product.name}
                              className={`w-full h-full object-contain ${isStale ? "opacity-40 filter grayscale" : ""}`}
                            />
                          </div>
                          <div className="flex flex-col min-w-0 truncate">
                            <span className={`font-semibold truncate ${isStale ? "text-gray-400 line-through" : "text-gray-900"}`}>
                              {product.name}
                            </span>
                            {isStale && (
                              <span className="text-[10px] w-fit font-bold text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded uppercase mt-0.5 tracking-wider">
                                Inactive (Soft-Deleted)
                              </span>
                            )}
                            {/* NEW POPULAR BADGE ELEMENT */}
                            {!isStale && product.isPopular && (
                              <span className="text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                ⭐ Featured (Popular)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 max-sm:hidden font-medium text-gray-500 capitalize">{product.category}</td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">${product.offerPrice}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              type="button"
                              onClick={() => openEditModal(product)} 
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs px-3 py-2 rounded transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            
                            {/* Toggleable Action Buttons Based on Status */}
                            {!isStale ? (
                              <button 
                                type="button"
                                onClick={() => handleProductStatusChange(product._id, "deactivate")} 
                                className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-xs px-2.5 py-2 rounded transition-colors cursor-pointer"
                                title="Soft-delete from client layouts"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => handleReactivateProduct(product)}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs px-2.5 py-2 rounded transition-colors cursor-pointer"
                                title="Restore item back to catalog tracks"
                              >
                                Reactivate
                              </button>
                            )}

                            <button 
                              type="button"
                              onClick={() => handleProductStatusChange(product._id, "hard-delete")} 
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-3 py-2 rounded transition-colors cursor-pointer"
                              title="Permanently erase record items and files"
                            >
                              Purge
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="p-16 text-center text-gray-400 font-medium">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-2xl mb-1">📦</span>
                        <p className="text-sm">No items found matching the "{activeTab}" tab constraints.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Responsive Inline Editor Modal Workspace */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Modify Product Parameters</h3>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-medium w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-5 flex-grow">
              
              {/* Title Field Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Product Title Name</label>
                <input 
                  type="text" 
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
                />
              </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Description</label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    (editingProduct.description || "").length >= 450
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-gray-50 text-gray-400 border-gray-200"
                  }`}>
                    {100 - (editingProduct.description || "").length} characters remaining
                  </span>
                </div>
                <textarea 
                  rows={3}
                  maxLength={100} // Strictly prevents inputs past our layout limits
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter deep features summary info..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 resize-y min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category Classification</label>
                  <select 
                    required
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 cursor-pointer bg-white"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Manual Featured Toggle */}
                <div className="flex items-center pb-2 h-full">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-600 select-none">
                    <input 
                      type="checkbox"
                      checked={editingProduct.isPopular || false}
                      onChange={(e) => setEditingProduct(prev => ({ ...prev, isPopular: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                    />
                    <span>Feature on Home (Popular)</span>
                  </label>
                </div>
              </div>

              {/* Twin Prices Grid Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* NEW: Base Original Price Field */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Original Price ($)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Offer Discounted Price ($)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={editingProduct.offerPrice}
                    onChange={(e) => setEditingProduct(prev => ({ ...prev, offerPrice: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600"
                  />
                </div>
              </div>
                {/* Real-time Pricing Mismatch Alert Callout Banner */}
              {Number(editingProduct.offerPrice) > Number(editingProduct.price) && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-700 font-medium animate-fade-in">
                  <span className="text-sm leading-none mt-0.5">⚠️</span>
                  <div>
                    <p className="font-bold">Invalid Price Configuration</p>
                    <p className="text-red-600/90 mt-0.5">The promotional offer price cannot be set higher than your item's original retail price.</p>
                  </div>
                </div>
              )}

              {/* Cloudinary Asset Media Management Frame */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Cloudinary Image Gallery ({editingProduct.image?.length + selectedImageFiles.length})
                </label>
                
                {/* Images Preview Matrix Grid */}
                <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto mb-3">
                  
                  {/* Active Cloudinary items */}
                  {editingProduct.image?.map((url, idx) => (
                    <div key={`cloud-${idx}`} className="relative group w-full aspect-square border border-gray-200 bg-white rounded overflow-hidden">
                      <img src={url} alt="Gallery item" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute inset-0 bg-red-600/80 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity duration-150 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Local staged files */}
                  {selectedImageFiles.map((file, idx) => (
                    <div key={`staged-${idx}`} className="relative group w-full aspect-square border border-amber-300 bg-amber-50/50 rounded overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt="Staged item" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => removeStagedFile(idx)}
                        className="absolute inset-0 bg-gray-900/80 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition-opacity duration-150 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}

                  {/* Trigger box tool to append images */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-gray-300 hover:border-orange-500 rounded flex flex-col items-center justify-center text-gray-400 hover:text-orange-600 transition-colors bg-white cursor-pointer"
                  >
                    <span className="text-xl font-bold">&#43;</span>
                    <span className="text-[10px] font-semibold mt-1">Add Image</span>
                  </button>
                </div>

                <input 
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Modal Control Footer Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={submitLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : "Save Product Details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
};
                  
export default ProductList;
                