import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Coupon from "@/models/Coupon";
import Tax from "@/models/Tax";
import User from "@/models/User"; // Adjust the path to your User schema file
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

        // 2. ROLE GATE: Verify if the logged-in user is actually an approved seller/admin
        //const sessionUser = await User.findById(userId);
        // Adjust this condition matching your true database role flag parameter (e.g. sessionUser.role === 'admin' or sessionUser.isSeller)
        //if (!sessionUser || !sessionUser.isSeller) {
        //  return NextResponse.json({ success: false, message: "Forbidden. Administrative privileges required." }, { status: 403 });
        //}

        // 3. Extract payload properties from incoming request body
        const body = await request.json();
        const { target, data } = body; // target: "coupon" | "tax"

        if (!target || !data || typeof data !== "object") {
            return NextResponse.json({ success: false, message: "Incomplete or malformed data payload parameter tracking." }, { status: 400 });
        }

        // ==========================================
        // BRANCH A: PROMO COUPON INJECTION ROUTINE
        // ==========================================
        if (target === "coupon") {
            const { code, type, value } = data;

            if (!code || !type || value === undefined) {
                return NextResponse.json({ success: false, message: "Missing required coupon parameters: code, type, or value." }, { status: 400 });
            }

            const validTypes = ["percentage", "fixed", "shipping"];
            if (!validTypes.includes(type)) {
                return NextResponse.json({ success: false, message: "Invalid coupon type classification rule specified." }, { status: 400 });
            }

            const cleanCode = code.trim().toUpperCase();

            // Uses an upsert query: updates if exists, inserts new document if not
            const couponResult = await Coupon.findOneAndUpdate(
                { code: cleanCode },
                {
                    code: cleanCode,
                    type,
                    value: Number(value)
                },
                { upsert: true, returnDocument: "after", runValidators: true }
            );

            return NextResponse.json({
                success: true,
                message: `Promo code "${cleanCode}" successfully processed and synchronized!`,
                data: couponResult
            }, { status: 200 });
        }

        // ==========================================
        // BRANCH B: TAX COMPONENTS UPDATE ROUTINE
        // ==========================================
        if (target === "tax") {
            const { key, type, value } = data;

            if (!key || !type || value === undefined) {
                return NextResponse.json({ success: false, message: "Missing required tax parameters: key, type, or value." }, { status: 400 });
            }

            const cleanKey = key.trim().toUpperCase();

            // Uses an upsert query to update matching keys (e.g. TAX1) or create a new row
            const taxResult = await Tax.findOneAndUpdate(
                { key: cleanKey },
                {
                    key: cleanKey,
                    type: type.trim().toUpperCase(),
                    value: Number(value)
                },
                { upsert: true, returnDocument: "after", runValidators: true }
            );

            return NextResponse.json({
                success: true,
                message: `Tax configuration "${cleanKey}" successfully updated in database!`,
                data: taxResult
            }, { status: 200 });
        }

        return NextResponse.json({ success: false, message: "Invalid payload branch target configuration token." }, { status: 400 });

    } catch (error) {
        console.error("Critical Exception in Seller Admin API Engine:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal server error occurred." }, { status: 500 });
    }
}
