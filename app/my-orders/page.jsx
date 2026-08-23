'use client';
import React, { useEffect, useState } from "react";
import { assets, orderDummyData } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";


const MyOrders = () => {

    const { currency, getToken, user,showToast } = useAppContext();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        //setOrders(orderDummyData)
        try{
            const token=await getToken()

            //const { data }= await axios.get('/api/order/list',{headers:{Authorization: `Bearer` ${token}}}
            
                 const { data } = await axios.get('/api/order/list', {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      });

            if(data.success)
            {
                    setOrders(data.orders.reverse())
                    setLoading(false);
            }
            else
            {
                showToast(data.message, 'error');
            }
        }
        catch(error) {
            showToast(error.message, 'error')
        }     
    }

    useEffect(() => {
        if(user)
        {
            fetchOrders();
        }
    }, [user]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">My Orders</h2>
                                       {loading ? <Loading /> : (
                        <div className="max-w-5xl border-t border-gray-300 text-sm">
                            {orders.map((order, index) => (
                                <div key={order._id || index} className="flex flex-col md:flex-row gap-6 justify-between p-5 border-b border-gray-300 items-start md:items-center">
                                    
                                    {/* Column 1: Items Display Summary */}
                                    <div className="flex gap-4 max-w-sm w-full">
                                        <Image
                                            className="w-14 h-14 object-cover bg-gray-50 border p-1 rounded self-start shrink-0"
                                            src={assets.box_icon}
                                            alt="box_icon"
                                            width={56}
                                            height={56}
                                        />
                                        <div className="flex flex-col gap-1 min-w-0">
                                            {/* Order Number Block Badge */}
                                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded self-start">
                                                {order.orderNumber || "ORD-PENDING"}
                                            </span>
                                            
                                            <p className="font-normal text-gray-900 leading-snug break-words mt-1">
                                                {order.items.map((item) => {
                                                    const pName = item.product && typeof item.product === 'object' 
                                                        ? item.product.name 
                                                        : "Product Item";
                                                    return `${pName} x ${item.quantity}`;
                                                }).join(", ")}
                                            </p>
                                            <span className="text-xs text-gray-400 font-medium">Item Count: {order.items.length}</span>
                                        </div>
                                    </div>

                                    {/* Column 2: FIXED Shipping Address (Renders multi-line string text blocks perfectly) */}
                                    <div className="text-gray-600 leading-relaxed text-xs max-w-xs w-full bg-gray-50/50 p-3 rounded-xl border border-gray-100 shadow-2xs">
                                        <h4 className="font-bold text-gray-400 text-[10px] uppercase tracking-wider mb-1">Shipping Destination</h4>
                                        <p className="whitespace-pre-line text-gray-900 font-medium font-sans">
                                            {typeof order.address === 'string' 
                                                ? order.address.trim() 
                                                : "No address snapshot data payload captured."}
                                        </p>
                                    </div>

                                    {/* Column 3: Grand Total Amount paid */}
                                    <div className="shrink-0">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block md:hidden mb-0.5">Grand Total</span>
                                        <p className="font-black text-lg text-gray-950">
                                            {currency}{(order.amount || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    {/* Column 4: Logistical Tracking Metrics Metadata */}
                                    <div className="text-xs font-semibold text-gray-500 shrink-0 min-w-[140px]">
                                        <p className="flex flex-col gap-1">
                                           {/* <span>Method : <strong className="text-gray-800">COD</strong></span>*/}
                                            <span>Date : <strong className="text-gray-800">{new Date(order.date).toLocaleDateString()}</strong></span>
                                            <span>Status : <strong className="text-orange-600 font-bold uppercase tracking-wide text-[10px] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">{order.status || "Order Placed"}</strong></span>
                                        </p>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;