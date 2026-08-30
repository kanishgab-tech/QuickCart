'use client'
import React, { useEffect, useState, useMemo, Suspense } from "react";
import axios from "axios";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";

const OrderProgressContent = () => {
    const { getToken, showToast, currency } = useAppContext();
    const [allOrders, setAllOrders] = useState([]); // Master unfiltered array container
    const [dateRange, setDateRange] = useState("all"); // Filter state lifecycle toggle: 'all', 'week', 'month'
    const [loading, setLoading] = useState(true);

    const fetchSellerOrdersList = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get('/api/order/seller-order?tab=order-progress', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success && data.orders) {
                setAllOrders(data.orders);
            } else {
                if (typeof showToast === "function") showToast(data.message, "error");
            }
        } catch (error) {
            if (typeof showToast === "function") showToast(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellerOrdersList();
    }, []);

    // NEW: Real-time filtering loop computes dynamic subsets based on dropdown selection
    const filteredOrders = useMemo(() => {
        if (dateRange === "all") return allOrders;

        const now = new Date();
        
        // Start of today at midnight
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRange === "week") {
            // Calculate distance to previous Monday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            const dayOfWeek = now.getDay();
            const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const startOfWeek = new Date(todayStart);
            startOfWeek.setDate(todayStart.getDate() - distanceToMonday);

            return allOrders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startOfWeek;
            });
        }

        if (dateRange === "month") {
            // First day of current month at midnight
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            return allOrders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startOfMonth;
            });
        }

        return allOrders;
    }, [allOrders, dateRange]);

    // Analytical metrics grouping matrix computed directly on filtered order subsets
    const orderStatusMetrics = useMemo(() => {
        const statusMap = {
            "Order Placed": { count: 0, revenue: 0, color: "bg-orange-500", hoverColor: "hover:bg-orange-600" },
            "Payment Pending": { count: 0, revenue: 0, color: "bg-amber-400", hoverColor: "hover:bg-amber-500" },
            "Shipped": { count: 0, revenue: 0, color: "bg-sky-500", hoverColor: "hover:bg-sky-600" },
            "Delivered": { count: 0, revenue: 0, color: "bg-emerald-500", hoverColor: "hover:bg-emerald-600" },
            "Cancelled": { count: 0, revenue: 0, color: "bg-rose-500", hoverColor: "hover:bg-rose-600" }
        };

        filteredOrders.forEach((order) => {
            const statusKey = order.status || "Order Placed";
            if (statusMap[statusKey]) {
                statusMap[statusKey].count += 1;
                statusMap[statusKey].revenue += (order.amount || 0);
            } else {
                statusMap[statusKey] = { count: 1, revenue: (order.amount || 0), color: "bg-slate-400", hoverColor: "hover:bg-slate-500" };
            }
        });

        return Object.entries(statusMap).map(([status, meta]) => ({
            status,
            ...meta
        }));
    }, [filteredOrders]);

    // Summary Card Cumulative Totals computed adaptively on filtered data
    const summaryCardTotals = useMemo(() => {
        let grossRevenue = 0;
        let pendingFulfillmentCount = 0;

        filteredOrders.forEach((order) => {
            if (order.status !== "Cancelled") {
                grossRevenue += (order.amount || 0);
            }
            if (["Order Placed", "Payment Pending", "Shipped"].includes(order.status)) {
                pendingFulfillmentCount += 1;
            }
        });

        return {
            grossRevenue,
            totalOrders: filteredOrders.length,
            pendingFulfillmentCount
        };
    }, [filteredOrders]);

    const maxOrderCount = useMemo(() => {
        const counts = orderStatusMetrics.map(m => m.count);
        return Math.max(...counts, 1); 
    }, [orderStatusMetrics]);

    // Generates clean, uniform integer increments starting strictly from 0 up to max count
    const yAxisTicks = useMemo(() => {
        const max = maxOrderCount;
        if (max <= 4) {
            return [4, 3, 2, 1, 0];
        }
        return [
            Math.round(max),
            Math.round(max * 0.75),
            Math.round(max * 0.5),
            Math.round(max * 0.25),
            0
        ];
    }, [maxOrderCount]);

    if (loading) return <Loading />;

    return (
        <div className="space-y-8 w-full max-w-5xl mx-auto">
            {/* Header Block Section with Integrated Filter Controls Row */}
            <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-left">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Order Progress Dashboard</h2>
                    <div className="w-12 h-0.5 bg-orange-600 rounded-full mt-1.5"></div>
                    <p className="text-xs text-gray-400 font-medium mt-1">Real-time analytical tracking review of fulfillment metrics and item volumes.</p>
                </div>

                {/* NEW: Dynamic Dropdown Select Filter Tool */}
                <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold text-gray-500">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">📅 Filter Range:</span>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white border border-gray-300 hover:border-gray-400 text-gray-800 font-bold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer shadow-3xs"
                    >
                        <option value="all">✨ All Time Records</option>
                        <option value="week">📅 This Week (Mon - Now)</option>
                        <option value="month">🗓️ This Month (Current)</option>
                    </select>
                </div>
            </div>

            {/* Cumulative Summary Metrics Highlight Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-lg shadow-3xs select-none">💰</div>
                    <div className="text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gross Revenue</span>
                        <span className="text-lg font-black font-mono text-gray-900 tracking-tight">
                            {currency || "₹"}{summaryCardTotals.grossRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-lg shadow-3xs select-none">🛍️</div>
                    <div className="text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Received</span>
                        <span className="text-lg font-black font-mono text-gray-900 tracking-tight">
                            {summaryCardTotals.totalOrders.toLocaleString('en-IN')} Orders
                        </span>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-2xs flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center text-lg shadow-3xs select-none">⏳</div>
                    <div className="text-left">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Pending</span>
                        <span className="text-lg font-black font-mono text-gray-900 tracking-tight">
                            {summaryCardTotals.pendingFulfillmentCount.toLocaleString('en-IN')} Processing
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Visual Chart Card Container */}
            <div className="bg-white border border-gray-200/80 p-5 md:p-6 rounded-2xl shadow-2xs space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Volume Distribution Chart</h3>
                
                {/* Fixed Scrollable container track with structural bottom padding to house text labels */}
                <div className="pt-10 pb-14 px-2 w-full overflow-x-auto select-none">
                    {/* UPGRADED HEIGHT: Increased from h-72 to h-96 to guarantee clearance room for top badges */}
                    <div className="flex min-w-[600px] h-96 relative">
                        
                        {/* Y-AXIS LABELS GRID */}
                        <div className="w-12 h-80 flex flex-col justify-between text-right text-[10px] font-mono font-bold text-gray-400 pr-3 relative shrink-0">
                            {yAxisTicks.map((tick, idx) => (
                                <span key={idx} className="h-0 flex items-center justify-end">{tick}</span>
                            ))}
                        </div>

                        {/* CHART CANVAS MAIN CONTAINER ROW */}
                        <div className="flex-grow h-80 relative border-l-2 border-b-2 border-gray-300 px-4">
                            
                            {/* BACKGROUND AXIS REFERENCE DASHED GUIDELINES */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-2">
                                {yAxisTicks.slice(0, yAxisTicks.length - 1).map((_, idx) => (
                                    <div key={idx} className="w-full border-t border-dashed border-gray-200 h-0" />
                                ))}
                            </div>

                            {/* FIXED: Leveraging a clean, rigid 5-column layout grid to make overlapping mathematically impossible */}
                            <div className="w-full h-full grid grid-cols-5 gap-4 items-end relative z-10">
                                {orderStatusMetrics.map((item, index) => {
                                    const calculatedPercentage = (item.count / maxOrderCount) * 100;
                                    return (
                                        <div key={index} className="flex flex-col items-center justify-end h-full relative group w-full">
                                            
                                            {/* Data count indicator badge locked directly above the bar ceiling margin */}
                                            <div 
                                                className="absolute transition-transform duration-300 transform group-hover:-translate-y-1 mb-2 z-20 flex flex-col items-center w-full whitespace-nowrap"
                                                style={{ bottom: `calc(${calculatedPercentage}% + 2px)` }}
                                            >
                                                <span className="bg-gray-900 text-white font-mono font-black text-[10px] px-2 py-0.5 rounded shadow-xs tracking-wide">
                                                    {item.count}
                                                </span>
                                                <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5"></div>
                                            </div>

                                            {/* Symmetrical individual colored bar layout */}
                                            <div 
                                                className={`${item.color} ${item.hoverColor} w-full max-w-[48px] rounded-t-lg transition-all duration-500 ease-out shadow-xs cursor-pointer`}
                                                style={{ height: `${calculatedPercentage}%` }}
                                            />

                                            {/* FIXED X-AXIS STATUS ROW: Driven by top-full anchor tags to remain perfectly visible */}
                                            <div className="absolute top-full left-0 right-0 text-center text-[10px] md:text-xs font-bold text-gray-500 pt-3 leading-tight break-words px-1">
                                                {item.status}
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Tabular Summary Section with CSV Export */}
            <div className="bg-white border border-gray-200/80 rounded-2xl shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50/50">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tabular Operational Summary</h3>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">Audited records matching current active chart metric volumes.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            try {
                                const headers = ["Fulfillment Status Phase", "Aggregate Count", `Accumulated Gross Revenue (${currency || 'INR'})`].join(",");
                                const rows = orderStatusMetrics.map(item => [`"${item.status}"`, item.count, item.revenue.toFixed(2)].join(","));
                                const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
                                const encodedUri = encodeURI(csvContent);
                                const downloadLink = document.createElement("a");
                                downloadLink.setAttribute("href", encodedUri);
                                downloadLink.setAttribute("download", `Order_Progress_${dateRange}_${new Date().toISOString().split('T')}.csv`);
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                document.body.removeChild(downloadLink);
                                if (typeof showToast === "function") showToast("Spreadsheet ledger downloaded successfully!", "success");
                            } catch (error) {
                                alert("Failed to export spreadsheet logs.");
                            }
                        }}
                        className="bg-white border border-gray-300 hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-3xs cursor-pointer flex items-center gap-2 select-none self-start sm:self-auto"
                    >
                        <span>📥</span> Export CSV Ledger
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] table-auto text-left text-xs font-semibold text-gray-500">
                        <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider text-[10px] border-b border-gray-200/50">
                            <tr>
                                <th className="py-3.5 px-6 font-bold">Fulfillment Status Phase</th>
                                <th className="py-3.5 px-6 font-bold text-center">Aggregate Count</th>
                                <th className="py-3.5 px-6 font-bold text-right">Accumulated Gross Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                            {orderStatusMetrics.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 flex items-center gap-2.5">
                                        <div className={`w-3 h-3 rounded-full ${item.color} shrink-0 shadow-2xs`} />
                                        <span className="text-gray-900 font-bold">{item.status}</span>
                                    </td>
                                    <td className="py-4 px-6 text-center font-mono font-bold text-sm text-gray-900">
                                        {item.count.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-4 px-6 text-right font-mono font-bold text-sm text-gray-900">
                                        {currency || "₹"}{(item.revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const OrderProgressDashboardPage = () => {
    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 w-full flex flex-col justify-start">
            <Suspense fallback={
                <div className="w-full text-center py-20 text-xs font-semibold text-gray-400 animate-pulse">
                    Compiling background analytics reporting matrices...
                </div>
            }>
                <ProductProgressTrackerWrapper />
            </Suspense>
        </div>
    );
};

const ProductProgressTrackerWrapper = () => <OrderProgressContent />;

export default OrderProgressDashboardPage;
