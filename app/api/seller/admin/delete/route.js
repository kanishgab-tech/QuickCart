import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Coupon from "@/models/Coupon";
import Tax from "@/models/Tax";
import User from "@/models/User";
import authSeller from "@/lib/authSeller";

export async function POST(request) {
    try {
        // 1. SECURITY GATE: Authenticate session via Clerk
        const auth = getAuth(request);
        const userId = auth?.userId;

        const isSeller=await authSeller(userId)
        if(!isSeller)
            {
                    return NextResponse.json({success:false, message: 'Not Authorized'})
            }

        await connectDB();

        
        // 3. Extract parameters from the request payload
        const body = await request.json();
        const { id, type } = body; // id: Mongoose _id | type: "coupon" or "tax"

        if (!id || !type) {
            return NextResponse.json({ success: false, message: "Missing required deletion parameters: id or type." }, { status: 400 });
        }

        // ==========================================
        // BRANCH A: PURGE PROMO COUPON DOCUMENT
        // ==========================================
        if (type === "coupon") {
            const deletedCoupon = await Coupon.findByIdAndDelete(id);
            if (!deletedCoupon) {
                return NextResponse.json({ success: false, message: "Target coupon not found or already removed." }, { status: 404 });
            }
            return NextResponse.json({ success: true, message: `Coupon "${deletedCoupon.code}" purged permanently.` }, { status: 200 });
        }

        // ==========================================
        // BRANCH B: PURGE TAX COMPONENT DOCUMENT
        // ==========================================
        if (type === "tax") {
            const deletedTax = await Tax.findByIdAndDelete(id);
            if (!deletedTax) {
                return NextResponse.json({ success: false, message: "Target tax configuration not found or already removed." }, { status: 404 });
            }
            return NextResponse.json({ success: true, message: `Tax setting "${deletedTax.key}" purged permanently.` }, { status: 200 });
        }

        return NextResponse.json({ success: false, message: "Invalid deletion target type classification token." }, { status: 400 });

    } catch (error) {
        console.error("Critical Exception in Admin Deletion API Engine:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal server error occurred." }, { status: 500 });
    }
}
