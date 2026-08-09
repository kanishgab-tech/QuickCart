import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Coupon from "@/models/Coupon";
import Tax from "@/models/Tax";
import User from "@/models/User"; // Adjust the path to your User schema file
import authSeller from "@/lib/authSeller";

export async function GET(request) {
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

        // 2. ROLE GATE: Verify if the logged-in account has active seller permissions
       // const sessionUser = await User.findById(userId);
       // if (!sessionUser || !sessionUser.isSeller) {
       //     return NextResponse.json({ success: false, message: "Forbidden. Administrative privileges required." }, { status: 403 });
       // }

        // 3. EXECUTE PARALLEL QUERIES: Fetch both datasets simultaneously to boost performance

        const [coupons, taxes] = await Promise.all([
            Coupon.find({}).sort({ code: 1 }), // Sorts coupon codes alphabetically
            Tax.find({}).sort({ key: 1 })     // Sorts tax parameters by key identifier
        ]);

        return NextResponse.json({
            success: true,
            coupons,
            taxes
        }, { status: 200 });

    } catch (error) {
        console.error("Critical Exception in Admin Configuration Listing API:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error occurred." },
            { status: 500 }
        );
    }
}
