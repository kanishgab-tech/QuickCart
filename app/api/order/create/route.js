import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import User from "@/models/User";
import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";



const generateUniqueOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStamp = `${year}${month}${day}`;

    // Generate a 5-character random alphanumeric string
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();

    return `ORD-${dateStamp}-${randomChars}`;
};


export async function POST(request) {
 
    try {
        const auth = getAuth(request);
        const userId = auth?.userId; // Will be null or undefined if the user is a guest

        // 1. Destructure guestEmail alongside address and items from the incoming request body
        const { address, items, guestEmail } = await request.json();
        await connectDB();

        // 2. REPLACED UNAUTHORIZED CHECK: If there is no userId, they MUST provide a guest email
        if (!userId && !guestEmail) {
            return NextResponse.json({ success: false, message: "Email required for guest checkout" }, { status: 400 });
        }

        if (!address || !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
        }

        // 3. FIXED REDUCE BUG: Replaced async .reduce with a clean for...of loop
        let rawAmount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (product) {
                rawAmount += product.price * item.quantity;
            }
        }
        const orderNumber = generateUniqueOrderNumber();
        // Apply 2% tax and use standard float rounding to prevent trailing JS math decimals
        const totalAmount = Math.round((rawAmount + (rawAmount * 0.02)) * 100) / 100;

        // 4. Send event data to Inngest, explicitly supplying guest configurations
        await inngest.send({
            name: "order/created",
            data: {
                orderNumber,
                userId: userId || null,   // Falls back to null so Mongoose knows it's a guest
                isGuest: !userId,        // Boolean flag for easy database indexing
                guestEmail: userId ? null : guestEmail,
                items,       
                amount: totalAmount, 
                address,
                date: Date.now(),
            }
        });

        // 5. HYBRID CART CLEARING: Only clear database carts for registered members
        if (userId) {
            const user = await User.findOne({ _id: userId });
            if (user) {
                user.cartItems = [];
                await user.save();
            }
        }

        // Inside your server-side POST handler route right after inngest.send():
        return NextResponse.json({ 
            success: true, 
            message: "Order Placed Successfully",
            orderNumber: orderNumber // 🌟 ENSURE THIS KEY MATCHES EXACTLY IN LOWERCASE/CAMELCASE 🌟
        }, { status: 201 });

        
    } catch (error) {
        console.log("Error creating order:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
