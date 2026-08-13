import { NextResponse } from "next/server";
import Coupon from "@/models/Coupon"; // Adjust path to your model
import connectDB from "@/config/db";


export async function GET() {
    try {
        await connectDB().catch(err => {
            throw new Error("Database connection timed out");
        });
        const couponsArray = await Coupon.find({});
        
        // Convert array to Key-Value map
        const couponMap = couponsArray.reduce((acc, coupon) => {
            acc[coupon.code] = {
                type: coupon.type,
                value: coupon.value
            };
            return acc;
        }, {});

        return NextResponse.json(couponMap, { status: 200 });
    } catch (error) {
        console.error("Coupons API Error:", error);
        return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
    }
}
