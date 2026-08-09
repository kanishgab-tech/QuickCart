'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";

const SellerAdminDashboard = () => {
    const { getToken, showToast } = useAppContext();

    // UI Panel States
    const [activeTab, setActiveTab] = useState("coupons"); // "coupons" | "taxes"
    const [loadingList, setLoadingList] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Dynamic Lists State Lifecycle
    const [couponsList, setCouponsList] = useState([]);
    const [taxesList, setTaxesList] = useState([]);

    // Form Inputs - Coupon Workspace
    const [couponForm, setCouponForm] = useState({ code: "", type: "percentage", value: "" });
    // Form Inputs - Tax Workspace
    const [taxForm, setTaxForm] = useState({ key: "", type: "GST", value: "" });

        // Fetch master lists directly from your MongoDB database collections
    const fetchAdminConfigurations = async () => {
        try {
            setLoadingList(true);
            const token = await getToken();
            
            if (!token) {
                showToast("Authentication session token missing. Please sign in again.", "error");
                return;
            }

            // FIXED: Fetches the live data payload directly from your new secure API route
            const { data } = await axios.get('/api/seller/admin/list', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                // Populate your react states with true Mongoose collection arrays
                setCouponsList(data.coupons || []);
                setTaxesList(data.taxes || []);
            } else {
                showToast(data.message || "Failed to load system settings.", "error");
            }

        } catch (error) {
            console.error("Error communicating with admin settings endpoint:", error);
            showToast(error.response?.data?.message || "Failed to fetch administrative lists.", "error");
        } finally {
            setLoadingList(false);
        }
    };


    useEffect(() => {
        fetchAdminConfigurations();
    }, []);

    // Handles form data submission to the dynamic unified backend admin API route
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const token = await getToken();
            const target = activeTab === "coupons" ? "coupon" : "tax";
            const payloadData = activeTab === "coupons" ? couponForm : taxForm;

            const { data } = await axios.post('/api/seller/admin/add', {
                target,
                data: payloadData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                showToast(data.message, "success");
                
                // Clear active fields upon successful database sync
                if (activeTab === "coupons") {
                    setCouponForm({ code: "", type: "percentage", value: "" });
                } else {
                    setTaxForm({ key: "", type: "GST", value: "" });
                }
                
                // Live UI List Refresh simulation 
                fetchAdminConfigurations();
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Operation failed.", "error");
        } finally {
            setSubmitLoading(false);
        }
        // Handles deletion loops with backend network integration
            
        const handleDeleteElement = async (id, targetType, identifierCode) => {
            if (!window.confirm(`Are you certain you want to permanently remove "${identifierCode}" from the database?`)) return;

            try {
                const token = await getToken();
                
                // FIXED: Sending real multi-part data payload to our new API deletion route
                const { data } = await axios.post('/api/seller/admin/delete', { 
                    id, 
                    type: targetType 
                }, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });

                if (data.success) {
                    showToast(data.message || "Item purged successfully!", "success");
                    
                    // Immediately remove from client UI state for atomic reactive feedback
                    if (targetType === "coupon") {
                        setCouponsList(prev => prev.filter(c => c._id !== id));
                    } else {
                        setTaxesList(prev => prev.filter(t => t._id !== id));
                    }
                } else {
                    showToast(data.message || "Failed to remove entry.", "error");
                }
            } catch (error) {
                console.error("Deletion API Request Failure:", error);
                showToast(error.response?.data?.message || "Failed to complete removal request.", "error");
            }
        };
    };

    // Handles deletion loops with immediate filter feedback
    const handleDeleteElement = async (id, targetType, identifierCode) => {
        if (!window.confirm(`Are you certain you want to permanently remove "${identifierCode}" from the system?`)) return;

        try {
            const token = await getToken();
            // Connect to your deletion routing logic matching your backend rules
            // const { data } = await axios.post('/api/seller/admin/delete', { id, type: targetType }, { headers: { Authorization: `Bearer ${token}` } });

            showToast(`${targetType === 'coupon' ? 'Coupon' : 'Tax parameter'} purged successfully!`, "success");
            
            if (targetType === "coupon") {
                setCouponsList(prev => prev.filter(c => c._id !== id));
            } else {
                setTaxesList(prev => prev.filter(t => t._id !== id));
            }
        } catch (error) {
            showToast("Failed to complete removal request.", "error");
        }
    };

        return (
        <div className="flex-1 min-h-screen bg-gray-50/50 p-4 md:p-10 space-y-6 text-sm text-gray-700">
            
            {/* Header Area */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Settings Master Dashboard</h2>
                <p className="text-xs text-gray-500 mt-1">Configure global promotion parameters, adjust multi-component tax values, or clear expired data slots.</p>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl max-w-xs border border-gray-200">
                <button
                    type="button"
                    onClick={() => setActiveTab("coupons")}
                    className={`flex-1 text-center py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "coupons" ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    🏷️ Coupons / Promo
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("taxes")}
                    className={`flex-1 text-center py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        activeTab === "taxes" ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-500 hover:text-gray-900"
                    }`}
                >
                    ⚖️ Tax Rates matrix
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Column 1: Config Injection Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-1">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                        Add / Edit {activeTab === "coupons" ? "Promo Code" : "Tax Component"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {activeTab === "coupons" ? (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Coupon Code</label>
                                    <input 
                                        type="text" required value={couponForm.code} placeholder="e.g. SUMMER20"
                                        onChange={(e) => setCouponForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                        className="w-full uppercase border border-gray-300 bg-gray-50/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 font-mono tracking-wider font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deduction Type</label>
                                        <select 
                                            value={couponForm.type} onChange={(e) => setCouponForm(prev => ({ ...prev, type: e.target.value, value: e.target.value === "shipping" ? 0 : prev.value }))}
                                            className="w-full border border-gray-300 bg-gray-50/50 rounded-lg px-3 py-2 text-xs focus:outline-none cursor-pointer focus:border-orange-600 font-medium"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Flat ($/₹)</option>
                                            <option value="shipping">Free Shipping</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Coupon Value</label>
                                        <input 
                                            type="number" required min="0" disabled={couponForm.type === "shipping"} value={couponForm.type === "shipping" ? 0 : couponForm.value}
                                            onChange={(e) => setCouponForm(prev => ({ ...prev, value: e.target.value }))}
                                            placeholder={couponForm.type === "percentage" ? "10" : "500"}
                                            className="w-full border border-gray-300 bg-gray-50/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-600 font-bold disabled:opacity-50 disabled:bg-gray-200"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tax Tracker Key Reference</label>
                                    <input 
                                        type="text" required value={taxForm.key} placeholder="e.g. TAX1"
                                        onChange={(e) => setTaxForm(prev => ({ ...prev, key: e.target.value.toUpperCase() }))}
                                        className="w-full uppercase border border-gray-300 bg-gray-50/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-600 font-mono tracking-wider font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tax Label Type</label>
                                        <input 
                                            type="text" required value={taxForm.type} placeholder="e.g. GST"
                                            onChange={(e) => setTaxForm(prev => ({ ...prev, type: e.target.value.toUpperCase() }))}
                                            className="w-full uppercase border border-gray-300 bg-gray-50/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-600 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tax Value Percentage (%)</label>
                                        <input 
                                            type="number" required min="0" max="100" step="0.1" value={taxForm.value} placeholder="5"
                                            onChange={(e) => setTaxForm(prev => ({ ...prev, value: e.target.value }))}
                                            className="w-full border border-gray-300 bg-gray-50/50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-600 font-bold"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button 
                            type="submit" disabled={submitLoading}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                        >
                            {submitLoading ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : "Synchronize Settings"}
                        </button>
                    </form>
                </div>

                {/* Column 2: Master Management Table Listings Grid */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm lg:col-span-2 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Active {activeTab === "coupons" ? "Promotions Register" : "Calculated Taxes Baseline"}
                        </h3>
                    </div>

                    {loadingList ? (
                        <div className="p-12 text-center text-gray-400 text-xs font-medium animate-pulse">
                            Retrieving dynamic matrix lists...
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full border-collapse text-left text-xs">
                                <thead className="bg-gray-100/80 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
                                    {activeTab === "coupons" ? (
                                        <tr>
                                            <th className="py-3 px-4">Promo Code</th>
                                            <th className="py-3 px-4">Deduction Class</th>
                                            <th className="py-3 px-4 text-right">Value Mapping</th>
                                            <th className="py-3 px-4 text-center w-24">Actions</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="py-3 px-4">Reference Key</th>
                                            <th className="py-3 px-4">Tax Type Label</th>
                                            <th className="py-3 px-4 text-right">Rate applied</th>
                                            <th className="py-3 px-4 text-center w-24">Actions</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                    {activeTab === "coupons" ? (
                                        couponsList.map(coupon => (
                                            <tr key={coupon._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold tracking-wide text-gray-900 bg-gray-50/20 select-all">
                                                    {coupon.code}
                                                </td>
                                                <td className="py-3 px-4 capitalize text-gray-500">
                                                    {coupon.type}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-gray-900">
                                                    {coupon.type === "percentage" 
                                                        ? `${coupon.value}%` 
                                                        : coupon.type === "shipping" 
                                                            ? "Free Delivery" 
                                                            : `₹ ${coupon.value}`}
                                                </td>
                                                <td className="py-2 px-4 text-center">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleDeleteElement(coupon._id, "coupon", coupon.code)} 
                                                        className="text-red-500 hover:text-red-700 underline font-semibold cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        taxesList.map(tax => (
                                            <tr key={tax._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3 px-4 font-mono font-bold tracking-wide text-gray-900 bg-gray-50/20 select-all">
                                                    {tax.key}
                                                </td>
                                                <td className="py-3 px-4 text-gray-500">
                                                    {tax.type}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-gray-900">
                                                    {tax.value}%
                                                </td>
                                                <td className="py-2 px-4 text-center">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleDeleteElement(tax._id, "tax", tax.key)} 
                                                        className="text-red-500 hover:text-red-700 underline font-semibold cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}
export default SellerAdminDashboard;

    

