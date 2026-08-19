import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import User from "@/models/User";
import Coupon from "@/models/Coupon"; // NEW: Imported dynamic models
import Tax from "@/models/Tax";       // NEW: Imported dynamic models
import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";

const generateUniqueOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStamp = `${year}${month}${day}`;
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `ORD-${dateStamp}-${randomChars}`;
};

export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth?.userId; 
        let rawAmount = 0;

        const { 
            address, 
            items, 
            amount, 
            guestEmail, 
            discountAmount, 
            shippingCharges, 
            couponCode, 
            notes 
        } = await request.json();
        
        await connectDB();

        // 1. Basic configuration validations
        if (!userId && !guestEmail) {
            return NextResponse.json({ success: false, message: "Email required for guest checkout" }, { status: 400 });
        }
        if (!address || !items || items.length === 0 || amount === undefined) {
            return NextResponse.json({ success: false, message: "Invalid or incomplete order data parameters." }, { status: 400 });
        }

        const cleanCouponCode = couponCode ? couponCode.trim().toUpperCase() : "";

        // 2. NEW: Fetch dynamic tax rules and coupons from MongoDB in parallel to optimize speed
        const [dbCoupon, dbTaxComponents] = await Promise.all([
            cleanCouponCode ? Coupon.findOne({ code: cleanCouponCode }) : Promise.resolve(null),
            Tax.find({}) // Downloads your entire active multi-component tax dictionary list
        ]);

        // 3. SECURITY RECALCULATION LOOP: Validate prices directly via database records
        let serverSubtotal = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.isActive === false) {
                return NextResponse.json({ 
                    success: false, 
                    message: `Product reference ${item.product} is currently unavailable or inactive.` 
                }, { status: 400 });
            }
               /*if (item.quantity > product.stock) {
                    return NextResponse.json({ 
                        success: false, 
                        message: `Overselling Blocked! "${product.name}" only has ${product.stock} units remaining in stock. Please reduce your cart quantity.` 
                    }, { status: 400 });
               }*/
            serverSubtotal += product.offerPrice * item.quantity;
        }

        // 4. SERVER-SIDE DYNAMIC DISCOUNTS EVALUATION
        let serverDiscountAmount = 0;
        if (dbCoupon) {
            if (dbCoupon.type === "percentage") {
                serverDiscountAmount = (serverSubtotal * dbCoupon.value) / 100;
            } else if (dbCoupon.type === "fixed") {
                serverDiscountAmount = Math.min(dbCoupon.value, serverSubtotal);
            }
            // Dynamic "shipping" coupons maintain product discount at 0, only override delivery fees
        }
        serverDiscountAmount = Math.round(serverDiscountAmount * 100) / 100;

        // 5. SERVER-SIDE DYNAMIC SHIPPING CHARGES EVALUATION
        let serverShippingCharges = 0;
        if (serverSubtotal > 0) {
            if (dbCoupon?.type === "shipping") {
                serverShippingCharges = 0; // Dynamic free shipping database override rule
            } else {
                serverShippingCharges = serverSubtotal >= 2000 ? 0 : 150; 
            }
        }

        // 6. SERVER-SIDE DYNAMIC TAX BREAKDOWN EVALUATION
        const taxableBasis = Math.max(0, serverSubtotal - serverDiscountAmount);
        let serverTotalTaxAmount = 0;
        
        // Loops through whatever rules currently exist in your MongoDB Tax collection
        dbTaxComponents.forEach((taxRule) => {
            const calculatedComponentTax = (taxableBasis * taxRule.value) / 100;
            serverTotalTaxAmount += calculatedComponentTax;
        });
        serverTotalTaxAmount = Math.round(serverTotalTaxAmount * 100) / 100;

        // 7. COMPUTE SECURE SERVER GRAND TOTAL
        const serverVerifiedGrandTotal = Math.max(0, (serverSubtotal + serverShippingCharges + serverTotalTaxAmount) - serverDiscountAmount);
        const serverVerifiedGrandTotalRounded = Math.round(serverVerifiedGrandTotal * 100) / 100;

        // 8. ANTI-FRAUD CROSS-CHECK: Intercept payload if totals deviate from server database calculations
        if (Math.abs(Number(amount) - serverVerifiedGrandTotalRounded) > 1.0) {
            console.error(`PRICE TAMPER LOCK: Frontend sent ${amount}, Database verified ${serverVerifiedGrandTotalRounded}`);
            return NextResponse.json({ 
                success: false, 
                message: "Transaction blocked. Security validation error: Invoice totals calculation variance detected." 
            }, { status: 400 });
        }

    //
  
    // AFTER successful order verification and right before sending response data, 
    // deduct stock levels using atomic Mongoose operations:
    /*for (const item of items) {
        await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } } // Subtracts purchased quantity cleanly from MongoDB
        );
    }*/
        
    const orderNumber = generateUniqueOrderNumber();


        // 9. Send validated data mapping arrays to Inngest microservice queue pipeline
        await inngest.send({
            name: "order/created",
            data: {
                orderNumber,
                userId: userId || null,   
                isGuest: !userId,        
                guestEmail: userId ? guestEmail : guestEmail.trim().toLowerCase(),
                items,       
                amount: serverVerifiedGrandTotalRounded, 
                address: address.trim(),
                status: "Order Placed",
                notes: notes ? notes.trim() : "", 
                shippingCharges: serverShippingCharges, 
                discountAmount: serverDiscountAmount, 
                couponCode: dbCoupon ? dbCoupon.code : "", 
                tax: serverTotalTaxAmount,
                date: Date.now(),
            }
        });

        // 10. HYBRID CART CLEARING: Only reset database profiles for registered members
        if (userId) {
            const user = await User.findOne({ _id: userId });
            if (user) {
                user.cartItems = [];
                await user.save();
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: "Order Placed Successfully",
            orderNumber: orderNumber 
        }, { status: 201 });

    } catch (error) {
        console.error("Critical Exception in Order Creation Route Handler:", error);
        return NextResponse.json({ success: false, message: error.message || "Internal server error occurred." }, { status: 500 });
    }
}
