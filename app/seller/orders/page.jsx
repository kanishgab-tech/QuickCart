'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

const Orders = () => {
    const { currency, getToken, user, showToast,products} = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter Controls State Lifecycle
    const [searchOrderNumber, setSearchOrderNumber] = useState("");
    const [filterCity, setFilterCity] = useState("All");
    const [filterDate, setFilterDate] = useState("");
    
    // NEW: Active Sub-Menu Tab Lifecycle State ("pending" | "completed")
    const [activeMenuTab, setActiveMenuTab] = useState("pending");
    const [setPendingCount] = useState(0);
    const [setCompletedCount] = useState(0);

    // Order Editing Window Lifecycle States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [modalSubmitLoading, setSubmitLoading] = useState(false);

    const openEditOrderModal = (order) => {
        // Clone order reference cleanly into local working memory scope
        setEditingOrder(JSON.parse(JSON.stringify(order)));
        setIsEditModalOpen(true);
    };

    const handleUpdateOrderDetails = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            const token = await getToken();
            const { data } = await axios.post('/api/order/update-details', {
                orderId: editingOrder._id,
                address: editingOrder.address,
                items: editingOrder.items,
                notes: editingOrder.notes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                showToast("Order records updated successfully!", "success");
                setIsEditModalOpen(false);
                fetchSellerOrders(); // Refresh master workspace lists from server
            }
        } catch (error) {
            showToast(error.response?.data?.message || "Failed to update details.", "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const fetchSellerOrders = async () => {
        try {
            setLoading(true); // Shows loading layout skeletons while waiting for network responses
            const token = await getToken();
            
            // Pass the tab parameter dynamically to download only the matching data subset
            const { data } = await axios.get(`/api/order/seller-order?tab=${activeMenuTab}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setOrders(data.orders);
                setPendingCount(data.pendingCount);   // Real-time server count synchronization
                setCompletedCount(data.completedCount);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

// 2. CRITICAL CHANGE: Re-fire fetch whenever user switches tabs
useEffect(() => {
    if (user) {
        fetchSellerOrders();
    }
}, [user, activeMenuTab]); // Listens to sub-menu state shifts dynamically

    // Function to handle inline order status changes via API
    const handleStatusUpdate = async (orderId, newStatus, currentNotes) => {
        try {
            const token = await getToken();
            const backupPreviousOrdersState = [...orders];

            // Optimistic UI state adjustment—handles both statuses and text data seamlessly
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus, notes: currentNotes } : o)
            );

            const { data } = await axios.post('/api/order/update-status', 
                { orderId, status: newStatus, notes: currentNotes }, // PASSED TO THE BACKEND
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                showToast("Order records synchronized successfully!", "success");
            } else {
                setOrders(backupPreviousOrdersState);
                showToast(data.message, "error");
            }
        } catch (error) {
            showToast("Failed to modify tracking parameters.", "error");
            fetchSellerOrders();
        }
    };


    // Multi-Criteria Reactive Filtering Pipeline
    const filteredOrders = orders.filter((order) => {
    // MongoDB handles tab segmentation for us now!
    
        const matchesNumber = order.orderNumber
            ?.toLowerCase()
            .includes(searchOrderNumber.trim().toLowerCase());

        let matchesDate = true;
        if (filterDate) {
            const orderLocalDate = new Date(order.date).toISOString().split('T')[0];
            matchesDate = orderLocalDate === filterDate;
        }

        let matchesCity = true;
        if (filterCity !== "All" && order.address) {
            matchesCity = order.address.toLowerCase().includes(filterCity.toLowerCase());
        }

        return matchesNumber && matchesDate && matchesCity;
    });

    // Extract dynamic unique cities from active list view to keep drops functional
    const uniqueCities = [
        "All",
        ...new Set(
            orders.map(order => {
                if (!order.address) return "";
                const parts = order.address.split(',');
                return parts.length > 1 ? parts[parts.length - 2].trim() : "";
            }).filter(Boolean)
        )
    ];

        // CSV Export Logic
    const handleExportCSV = () => {
        if (filteredOrders.length === 0) {
            showToast("No data rows available to export.", "error");
            return;
        }
        const headers = ["Order Number", "Date", "Items Summary", "Shipping Cost", "Coupon", "Discount", "Grand Total", "Status", "Address"];
        const rows = filteredOrders.map(order => [
            `"${order.orderNumber}"`,
            `"${new Date(order.date).toLocaleDateString()}"`,
            `"${order.items.map(i => `${typeof i.product === 'object' ? i.product.name : 'Product'} (x${i.quantity})`).join(" | ")}"`,
            order.shippingCharges || 0,
            `"${order.couponCode || 'NONE'}"`,
            order.discountAmount || 0,
            order.amount,
            `"${order.status}"`,
            `"${order.address ? order.address.replace(/\n/g, ' ') : ""}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `${activeMenuTab}_orders_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Excel Export Logic
    const handleExportExcel = () => {
        if (filteredOrders.length === 0) {
            showToast("No data rows available to export.", "error");
            return;
        }
        const excelData = filteredOrders.map((order, idx) => ({
            "S.No": idx + 1,
            "Order Number": order.orderNumber,
            "Order Date": new Date(order.date).toLocaleDateString(),
            "Products Summary": order.items.map(i => `${typeof i.product === 'object' ? i.product.name : 'Product'} (x${i.quantity})`).join(", "),
            "Shipping Cost": order.shippingCharges || 0,
            "Coupon Code": order.couponCode || "NONE",
            "Discount": order.discountAmount || 0,
            "Grand Total": order.amount,
            "Status": order.status,
            "Shipping Address": order.address ? order.address.replace(/\n/g, ' ') : ""
        }));
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders Report");
        XLSX.writeFile(workbook, `${activeMenuTab}_orders_report.xlsx`);
    };

    // PDF Export Logic
    const handleExportPDF = () => {
        if (filteredOrders.length === 0) {
            showToast("No data rows available to export.", "error");
            return;
        }
        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
        doc.setFont("helvetica", "bold").setFontSize(14);
        doc.text(`${activeMenuTab.toUpperCase()} ORDERS DETAILED REPORT`, 14, 15);
        
        const tableHeaders = [["#", "Order ID", "Date", "Items/Qty", "Shipping", "Coupon", "Discount", "Total", "Status"]];
        const tableRows = filteredOrders.map((order, idx) => [
            idx + 1,
            order.orderNumber,
            new Date(order.date).toLocaleDateString(),
            order.items.map(i => `${typeof i.product === 'object' ? i.product.name : 'Product'} (x${i.quantity})`).join("\n"),
            `${currency}${order.shippingCharges || 0}`,
            order.couponCode || "NONE",
            `${currency}${order.discountAmount || 0}`,
            `${currency}${order.amount.toLocaleString('en-IN')}`,
            order.status
        ]);

        autoTable(doc, {
            startY: 22,
            head: tableHeaders,
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor:'#ea580c', textColor:'#000000', fontSize: 8, halign: 'center' },
            bodyStyles: { fontSize: 8, valign: 'top' },
            columnStyles: { 0: { cellWidth: 8 }, 1: { cellWidth: 32 }, 2: { cellWidth: 20 }, 3: { cellWidth: 60 }, 4: { cellWidth: 18 }, 5: { cellWidth: 22 }, 6: { cellWidth: 18 }, 7: { cellWidth: 24 }, 8: { cellWidth: 25 } }
        });
        doc.save(`${activeMenuTab}_orders_report.pdf`);
    };


    const getStatusColor = (status) => {
        switch (status) {
            case "Order Placed": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Payment Pending": return "bg-amber-50 text-amber-700 border-amber-200";
            case "Shipped": return "bg-purple-50 text-purple-700 border-purple-200";
            case "Delivered": return "bg-green-50 text-green-700 border-green-200";
            case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    // Tab counts calculation helpers for sub-menu labels
    const pendingCount = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled").length;
    const completedCount = orders.filter(o => o.status === "Delivered" || o.status === "Cancelled").length;

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm bg-gray-50/50">
            {loading ? <Loading /> : (
                <div className="md:p-10 p-4 space-y-6">
                    
                    {/* Header Controls Area */}
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-gray-200 pb-5">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Orders Dashboard</h2>
                            <p className="text-xs text-gray-500 mt-1">Review processing pipelines, modify workflow status flags, or generate metrics sheets.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                            <button type="button" onClick={handleExportExcel} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors">📊 Export Excel</button>
                            <button type="button" onClick={handleExportPDF} className="bg-red-700 hover:bg-red-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 cursor-pointer transition-colors">📄 Export PDF</button>
                        </div>
                    </div>

                    {/* Seller Dashboard Sub-Menu Tab Controllers */}
                    <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl max-w-sm border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setActiveMenuTab("pending")}
                            className={`flex-1 text-center py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                activeMenuTab === "pending"
                                    ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Pending Fulfillment <span className={`ml-1 text-[10px] ${activeMenuTab === "pending" ? "text-orange-600 font-bold" : "text-gray-400"}`}>({pendingCount})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveMenuTab("completed")}
                            className={`flex-1 text-center py-2 px-4 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                activeMenuTab === "completed"
                                    ? "bg-white text-gray-900 shadow-sm border border-gray-100"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            Completed Orders <span className={`ml-1 text-[10px] ${activeMenuTab === "completed" ? "text-orange-600 font-bold" : "text-gray-400"}`}>({completedCount})</span>
                        </button>
                    </div>

                    {/* Filter Controls Row */}
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Search Order Number</label>
                            <input type="text" value={searchOrderNumber} onChange={(e) => setSearchOrderNumber(e.target.value)} placeholder="Type order ID..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filter by Shipping City</label>
                            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs capitalize focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50 cursor-pointer">
                                {uniqueCities.map(city => <option key={city} value={city}>{city === "All" ? "All Cities" : city}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filter by Specific Date</label>
                            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50 cursor-pointer" />
                        </div>
                    </div>

                    {/* Primary Dashboard Listings Viewport */}
                    <div className="max-w-4xl rounded-xl bg-white border border-gray-200 divide-y divide-gray-100 shadow-sm overflow-hidden">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div key={order._id} className="flex flex-col p-5 gap-5 hover:bg-gray-50/30 transition-colors">
                                    
                                    {/* Order Subheading Metadata Flex Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg">
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                                            <span>Order Reference:</span>
                                            <span className="font-mono bg-gray-200/80 text-gray-800 px-2 py-0.5 rounded text-xs select-all font-bold">
                                                {order.orderNumber}
                                            </span>
                                            {order.isGuest && (
                                                <span className="ml-2 bg-gray-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">Guest</span>
                                            )}
                                        </div>
                                        
                                        {/* Status Modifier Dropdown Controller */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEditOrderModal(order)}
                                                className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-bold text-xs px-2.5 py-1 rounded-md transition cursor-pointer"
                                            >
                                                ✏️ Edit Order
                                            </button>
                                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                className={`text-xs font-semibold px-2 py-1 border rounded-md cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}
                                            >
                                                <option value="Order Placed">Order Placed</option>
                                                <option value="Payment Pending">Payment Pending</option>
                                                <option value="Shipped">Shipped</option>
                                                <option value="Delivered">Delivered</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Auto-Adjusting Fluid Layout (Replaced rigid grid-cols-5) */}
                                    <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-3 w-full text-sm">
                                        
                                        {/* Block 1: Products Summary - Autogrows to fit long text strings */}
                                        <div className="flex gap-4 min-w-[240px] max-w-full md:max-w-[30%] shrink-0">
                                            <Image className="w-14 h-14 object-cover bg-gray-50 p-1 border border-gray-200 rounded self-start shrink-0" src={assets.box_icon} alt="box_icon" />
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <p className="font-semibold text-gray-900 leading-snug break-words">
                                                    {order.items.map((item) => {
                                                        let pName = "Product Item";
                                                        if (item.product && typeof item.product === 'object') {
                                                            pName = item.product.name;
                                                        } else if (typeof item.product === 'string' && products) {
                                                            const matchedProduct = products.find(p => (p._id === item.product || p.id === item.product));
                                                            if (matchedProduct) pName = matchedProduct.name;
                                                        }
                                                        return `${pName} x ${item.quantity}`;
                                                    }).join(", ")}
                                                </p>
                                                <span className="text-xs text-gray-400 font-medium mt-1">Unique Lines: {order.items.length}</span>
                                                {order.isGuest && order.guestEmail && (
                                                    <span className="text-xs text-gray-500 font-medium truncate mt-0.5">Email: {order.guestEmail}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Block 2: Shipping Destination - Wider allocation prevents word congestion */}
                                        <div className="text-gray-600 leading-relaxed text-xs min-w-[200px] flex-1 max-w-sm">
                                            <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-1">Shipping Destination</h4>
                                            <p className="whitespace-pre-line text-gray-900 font-medium bg-gray-50/50 p-3 rounded border border-gray-100 shadow-2xs">
                                                {order.address || "No address data payload block captured."}
                                            </p>
                                        </div>

                                        {/* Block 3: Financial Summary - Compact fixed structural block */}
                                        <div className="bg-gray-50/50 border border-gray-200/80 p-3 rounded-lg flex flex-col gap-1 text-[11px] text-gray-500 font-medium shrink-0 w-[160px] shadow-2xs">
                                            <div className="flex justify-between">
                                                <span>Shipping:</span>
                                                <span className="text-gray-900 font-semibold">
                                                    {order.shippingCharges === 0 ? "Free" : `${currency}${order.shippingCharges}`}
                                                </span>
                                            </div>
                                            {order.discountAmount > 0 && (
                                                <div className="flex justify-between text-green-600">
                                                    <span className="truncate max-w-[85px]">Coupon ({order.couponCode}):</span>
                                                    <span>&minus;{currency}{order.discountAmount}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200 pt-1 mt-1 flex flex-col items-start">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Grand Total</span>
                                                <p className="font-black text-base text-gray-950 leading-tight">
                                                    {currency}{order.amount?.toLocaleString('en-IN')}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                                                    Date: {new Date(order.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                       
                                    </div> {/* Closes Row Container */}

                                    {/* Increased Width Comments / Tracking Logs Text Input Box */}
                                            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex flex-col gap-1.5 flex-grow w-full">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Comments/Logs</span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                                                        (order.notes || "").length >= 450 ? "bg-red-100 text-red-600" : "text-gray-400"
                                                    }`}>
                                                        {500 - (order.notes || "").length} rem.
                                                    </span>
                                                </div>
                                                
                                                <textarea
                                                    rows={2}
                                                    maxLength={500}
                                                    defaultValue={order.notes || ""}
                                                    placeholder="Enter courier vendor, tracking reference number, or package logs..."
                                                    onBlur={(e) => handleStatusUpdate(order._id, order.status, e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-[11px] font-medium leading-normal text-gray-800 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-500 resize-none min-h-[44px]"
                                                />
                                            </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-16 text-center text-gray-400 font-medium flex flex-col items-center justify-center bg-white rounded-xl">
                                <span className="text-2xl mb-1">🔍</span>
                                <p className="text-sm">No orders found matching the "{activeMenuTab}" sub-menu selection parameters.</p>
                            </div>
                        )}
                    </div>
                                {/* Inline Administrative Order Editor Modal Overlay */}
            {isEditModalOpen && editingOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col border border-gray-100">
                        
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Modify Order Parameters</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Ref: {editingOrder.orderNumber}</p>
                            </div>
                            <button 
                                type="button" onClick={() => setIsEditModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-200/60 text-gray-500 font-bold flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleUpdateOrderDetails} className="p-5 space-y-4 flex-grow text-xs font-semibold text-gray-600">
                            
                            {/* Address Snapshot Input Area */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-gray-400 text-[10px] uppercase tracking-wider block">Shipping Address Destination</label>
                                <textarea
                                    rows={3} required value={editingOrder.address}
                                    onChange={(e) => setEditingOrder(prev => ({ ...prev, address: e.target.value }))}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs text-gray-800 focus:outline-none focus:border-orange-500 font-medium leading-relaxed"
                                />
                            </div>
                            {/* Dynamic Items Quantities Tracker Matrix */}
                            <div className="space-y-2">
                                <label className="text-gray-400 text-[10px] uppercase tracking-wider block border-b pb-1">Purchased Product Quantities</label>
                                <div className="divide-y divide-gray-100 max-h-44 overflow-y-auto space-y-2 pr-1">
                                    {editingOrder.items.map((item, idx) => {
                                        // FIXED: Multi-Scenario Fallback logic matching populated objects or raw string catalog caches
                                        let productName = "Product Line Item";
                                        
                                        // Scenario A: Check if the product was successfully populated as an object reference
                                        if (item.product && typeof item.product === 'object') {
                                            productName = item.product.name;
                                        } 
                                        // Scenario B: If it's a raw String ID, extract the true name from your AppContext's products array
                                        else if (typeof item.product === 'string' && products) {
                                            const matchedProduct = products.find(p => (p._id === item.product || p.id === item.product));
                                            if (matchedProduct) {
                                                productName = matchedProduct.name;
                                            }
                                        }

                                        return (
                                            <div key={idx} className="flex items-center justify-between gap-4 py-2 pt-3">
                                                <span className="text-gray-900 font-semibold truncate max-w-xs">{productName}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="text-gray-400 text-[10px]">Qty:</span>
                                                    <input
                                                        type="number" min="1" required
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const updatedItems = [...editingOrder.items];
                                                            updatedItems[idx].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
                                                            setEditingOrder(prev => ({ ...prev, items: updatedItems }));
                                                        }}
                                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-center font-bold text-gray-900 focus:outline-none focus:border-orange-500 bg-gray-50/50"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>


                            {/* Operational Command Buttons Footer */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                                <button
                                    type="button" onClick={() => setIsEditModalOpen(false)} disabled={modalSubmitLoading}
                                    className="px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-500 hover:bg-gray-50 transition cursor-pointer text-[11px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit" disabled={modalSubmitLoading}
                                    className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold rounded-lg shadow-sm transition cursor-pointer text-[11px] flex items-center gap-1.5"
                                >
                                    {modalSubmitLoading ? (
                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : "Save Changes & Recalculate"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Orders;
