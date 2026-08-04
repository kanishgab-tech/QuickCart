'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable  from 'jspdf-autotable';

const Orders = () => {
    const { currency, getToken, user, showToast } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter Controls State Lifecycle
    const [searchOrderNumber, setSearchOrderNumber] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterDate, setFilterDate] = useState("");



    const fetchSellerOrders = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/order/seller-order', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setOrders(data.orders);
                setLoading(false);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast(error.message, 'error');
        }    
    };

    useEffect(() => {
        if (user) {
            fetchSellerOrders();
        }
    }, [user]);

    // Function to handle inline order status persistence changes via API
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = await getToken();

            // Step A: Snapshot the current state in case you need to revert it upon a server error
            const backupPreviousOrdersState = [...orders];

            // Step B: Optimistic UI update—instantly change state locally for snappy UI feel
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
            );

            // Step C: Send payload to your database engine API endpoint
            const response = await fetch('/api/order/seller-order-update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Ensure your Clerk/Auth token passes cleanly
                },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            const data = await response.json();

            if (data.success) {
                showToast("Order status successfully updated in database!", "success");
            } else {
                // Roll back to previous snapshot if backend validation filters rejected the update
                setOrders(backupPreviousOrdersState);
                showToast(data.message || "Failed to update status.", "error");
            }
        } catch (error) {
            console.error("Status synchronization request failure:", error);
            showToast("Network error. Unable to persist status modification.", "error");
            fetchSellerOrders(); // Re-fetch the layout state from the server as a fallback safety
        }
    };
    // Multi-Criteria Reactive Filtering Pipeline
    const filteredOrders = orders.filter((order) => {
        const matchesNumber = order.orderNumber
            ?.toLowerCase()
            .includes(searchOrderNumber.trim().toLowerCase());

        const matchesStatus = filterStatus === "All" || order.status === filterStatus;

        let matchesDate = true;
        if (filterDate) {
            const orderLocalDate = new Date(order.date).toISOString().split('T')[0];
            matchesDate = orderLocalDate === filterDate;
        }

        return matchesNumber && matchesStatus && matchesDate;
    });
// CSV Export Logic (Respects active user filtering parameters)
const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
        showToast("No filtered records available to export.", "error");
        return;
    }

    const headers = ["Order Number", "Date", "Customer Email", "Items Summary", "Total Amount", "Status", "Delivery Address"];
    
    const rows = filteredOrders.map(order => {
        const dateStr = new Date(order.date).toLocaleDateString();
        const emailStr = order.isGuest ? order.guestEmail : "Registered Account";
        const itemsStr = order.items.map(i => `${typeof i.product === 'object' ? i.product.name : 'Product'} (x${i.quantity})`).join(" | ");
        
        // Handle address parsing dynamically for string vs sub-document schema states safely
        let displayAddress = "";
        if (typeof order.address === 'object' && order.address !== null) {
            displayAddress = `${order.address.fullName || ''}, ${order.address.area || order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''}`;
        } else {
            displayAddress = order.address ? order.address.replace(/\n/g, ' ') : "";
        }

        return [
            `"${order.orderNumber}"`,
            `"${dateStr}"`,
            `"${emailStr}"`,
            `"${itemsStr}"`,
            order.amount,
            `"${order.status}"`,
            `"${displayAddress.replace(/"/g, '""')}"` // Double-escapes quotes inside cell strings
        ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `filtered_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("CSV file downloaded successfully!", "success");
};

// Excel Export Logic (Respects active user filtering parameters)
const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
        showToast("No filtered records available to export.", "error");
        return;
    }

    const excelData = filteredOrders.map((order, idx) => {
        const dateStr = new Date(order.date).toLocaleDateString();
        const itemsStr = order.items
            .map(i => `${typeof i.product === 'object' ? i.product.name : 'Product'} (x${i.quantity})`)
            .join(", ");
            
        let displayAddress = "";
        if (typeof order.address === 'object' && order.address !== null) {
            displayAddress = `${order.address.fullName || ''}, ${order.address.area || order.address.street || ''}, ${order.address.city || ''}, ${order.address.state || ''}`;
        } else {
            displayAddress = order.address ? order.address.replace(/\n/g, ' ') : "";
        }

        return {
            "S.No": idx + 1,
            "Order Number": order.orderNumber,
            "Order Date": dateStr,
            "Customer Type": order.isGuest ? "Guest" : "Registered User",
            "Customer Email": order.isGuest ? order.guestEmail : "Registered Account",
            "Products Summary": itemsStr,
            "Amount": `${currency}${order.amount}`,
            "Status": order.status,
            "Shipping Address": displayAddress
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Report");

    const columnKeys = Object.keys(excelData[0]);
    const maxColumnWidths = columnKeys.map(key => {
        const maxCharLength = Math.max(
            key.length,
            ...excelData.map(row => (row[key] ? row[key].toString().length : 0))
        );
        return { wch: maxCharLength + 4 };
    });
    
    worksheet["!cols"] = maxColumnWidths;

    XLSX.writeFile(workbook, `filtered_orders_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast("Excel spreadsheet downloaded successfully!", "success");
};

// PDF Export Logic (Respects active user filtering parameters)
const handleExportPDF = () => {
    if (filteredOrders.length === 0) {
        showToast("No filtered records available to export.", "error");
        return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("FILTERED ORDERS PERFORMANCE REPORT", 14, 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 21);
    doc.text(`Active Filter Match Count: ${filteredOrders.length} records`, 14, 25);

    const tableHeaders = [["#", "Order ID", "Date", "Customer Info", "Items/Qty", "Total", "Status", "Shipping Destination"]];

    const tableRows = filteredOrders.map((order, idx) => {
        const dateStr = new Date(order.date).toLocaleDateString();
        const customerInfo = order.isGuest ? `Guest:\n${order.guestEmail}` : "Registered User";
        const itemsStr = order.items
            .map(i => `${typeof i.product === 'object' ? i.product.name : 'Product Item'} (x${i.quantity})`)
            .join("\n");

        let displayAddress = "";
        if (typeof order.address === 'object' && order.address !== null) {
            displayAddress = `${order.address.fullName || ''}\n${order.address.area || order.address.street || ''}\n${order.address.city || ''}, ${order.address.state || ''}`;
        } else {
            displayAddress = order.address || "N/A";
        }

        return [
            idx + 1,
            order.orderNumber,
            dateStr,
            customerInfo,
            itemsStr,
            `${currency}${order.amount?.toLocaleString('en-IN')}`,
            order.status,
            displayAddress
        ];
    });

    autoTable(doc, {
        startY: 30,
        head: tableHeaders,
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, textColor: [50, 50, 50], valign: 'top' },
        columnStyles: {
            0: { cellWidth: 10, halign: 'center' }, 
            1: { cellWidth: 32, fontStyle: 'bold' }, 
            2: { cellWidth: 22, halign: 'center' }, 
            3: { cellWidth: 35 }, 
            4: { cellWidth: 55 }, 
            5: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }, 
            6: { cellWidth: 28, halign: 'center' }, 
            7: { cellWidth: 65 } 
        },
        styles: { overflow: 'linebreak', cellPadding: 3 },
        alternateRowStyles: { fillColor: [248, 249, 250] }
    });

    doc.save(`filtered_orders_report_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast("PDF document downloaded successfully!", "success");
};
    // Helper mapping structure to colorize dashboard state elements dynamically
    const getStatusColor = (status) => {
        switch (status) {
            case "Order Placed": return "bg-blue-50 text-blue-700 border-blue-200";
            case "Payment Pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "Shipped": return "bg-purple-50 text-purple-700 border-purple-200";
            case "Delivered": return "bg-green-50 text-green-700 border-green-200";
            case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

        return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm bg-gray-50/50">
            {loading ? <Loading /> : (
                <div className="md:p-10 p-4 space-y-6">
                    {/* Header Layout Section with Multi-Format Export Options */}
                    <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-gray-200 pb-5">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Orders Management Panel</h2>
                            <p className="text-xs text-gray-500 mt-1">Review pipeline records, modify tracking phases, and export report files.</p>
                        </div>
                        
                        <button className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs  flex flex-wrap items-center gap-2 self-start xl:self-auto"
                         type="button" onClick={handleExportCSV}>
                            <span>📊</span>Export CSV</button>

                        {/* Clean Action Dropdown Flex Box Group */}
                        <div className="flex flex-wrap items-center gap-2 self-start xl:self-auto">
                            <button
                                type="button" onClick={handleExportExcel}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <span>📊</span> Export Excel (.XLSX)
                            </button>
                            <button
                                type="button"
                                onClick={handleExportPDF}
                                className="bg-red-700 hover:bg-red-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                            >
                                <span>📄</span> Export Document (.PDF)
                            </button>
                        </div>
                    </div>

                    {/* Filter & Controls Panel Action Bar */}
                    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Search Order Number</label>
                            <input 
                                type="text"
                                value={searchOrderNumber}
                                onChange={(e) => setSearchOrderNumber(e.target.value)}
                                placeholder="Type order ID..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filter by Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50 cursor-pointer"
                            >
                                <option value="All">All Statuses</option>
                                <option value="Order Placed">Order Placed</option>
                                <option value="Payment Pending">Payment Pending</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filter by Specific Date</label>
                            <input 
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-600 bg-gray-50/50 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Primary Dashboard Listings Viewport */}
                    <div className="max-w-4xl rounded-xl bg-white border border-gray-200 divide-y divide-gray-100 shadow-xs overflow-hidden">
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
                                                <span className="ml-2 bg-gray-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-semibold">
                                                    Guest
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Status Modifier Selector Controller */}
                                        <div className="flex items-center gap-2">
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

                                    {/* Table Grid Columns */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                                        {/* Items Display Column */}
                                        <div className="md:col-span-2 flex gap-4">
                                            <Image
                                                className="max-w-14 max-h-14 object-cover bg-gray-50 p-1 border border-gray-200 rounded self-start shrink-0"
                                                src={assets.box_icon}
                                                alt="box_icon"
                                            />
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <p className="font-semibold text-gray-900 leading-tight">
                                                    {order.items.map((item) => {
                                                        const pName = typeof item.product === 'object' ? item.product.name : 'Product Item';
                                                        return `${pName} x ${item.quantity}`;
                                                    }).join(", ")}
                                                </p>
                                                <span className="text-xs text-gray-400 font-medium mt-1">Unique Lines: {order.items.length}</span>
                                                {order.isGuest && order.guestEmail && (
                                                    <span className="text-xs text-gray-500 font-medium truncate mt-0.5">Email: {order.guestEmail}</span>
                                                )}
                                            </div>
                                        </div>
{/* Shipping plain-text string formatting view */}
                                        <div className="text-gray-600 leading-relaxed text-xs">
                                            <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-1">Shipping Destination</h4>
                                            <p className="whitespace-pre-line text-gray-900 font-medium bg-gray-50/50 p-2.5 rounded border border-gray-100">
                                                {order.address || "No address data payload block captured."}
                                            </p>
                                        </div>

                                        {/* Price block metrics */}
                                        <div className="flex md:flex-col justify-between items-baseline md:items-end gap-1 md:text-right">
                                            <div>
                                                <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-wider block mb-0.5">Fulfillment Total</h4>
                                                <p className="font-black text-base text-gray-950">
                                                    {currency}{order.amount?.toLocaleString('en-IN')}
                                                </p>
                                            </div>
                                            <div className="text-gray-400 font-medium text-xs mt-1">
                                                <span>Date: <span className="text-gray-700 font-medium">{new Date(order.date).toLocaleDateString()}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-16 text-center text-gray-400 font-medium flex flex-col items-center justify-center">
                                <span className="text-2xl mb-1">🔍</span>
                                <p className="text-sm">No orders match your chosen filters. Please adjust your search criteria or check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};
export default Orders;