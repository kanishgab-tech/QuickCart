import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import Address from "@/models/Address";
import Order from "@/models/Order";
import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";



export async function GET(request)
{
    try 
    {
        const auth = getAuth(request);
        const userId = auth?.userId;

        const isSeller=await authSeller(userId)
        if(!isSeller)
        {
            return NextResponse.json({success:false, message: 'Not Authorized'})
        }
        
        await connectDB()
    
        // 1. Extract the active tab parameter from the request URL queries
        const { searchParams } = new URL(request.url);
        const tab = searchParams.get("tab") || "pending"; // Defaults to pending

          // 2. Build the MongoDB status query condition dynamically
        let statusQuery = {};
        if (tab === "completed") {
            // Only query finished items from the collection matching your schema status keys
            //statusQuery = { status: { $in: ["Delivered", "Cancelled","Completed"] } };
            statusQuery = { status: { $nin: ["Order Placed", "Payment Pending", "Shipped"] } };
        } else {
            // Default: Fetch only unresolved ongoing fulfillment tasks
            statusQuery = { status: { $in: ["Order Placed", "Payment Pending", "Shipped"] } };
        }

           // 3. Optional: Add a second query count helper for your tab badges 
        // without loading full document rows into memory
        const totalPendingCount = await Order.countDocuments({ status: { $in: ["Order Placed", "Payment Pending", "Shipped"] } });
        const totalCompletedCount = await Order.countDocuments({ status: { $in: ["Delivered", "Cancelled"] } });

        // 4. Query the exact slice of data needed, sorting newest orders first
        const orders = await Order.find(statusQuery).sort({ date: -1 });

            return NextResponse.json({
                success: true,
                pendingCount: totalPendingCount,
                completedCount: totalCompletedCount,
                orders: orders
            }, { status: 200 });

        } catch (error) {
            console.error("Seller Orders Fetch API Error:", error);
            return NextResponse.json({ success: false, message: error.message }, { status: 500 });
        }
    }
