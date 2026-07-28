import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";
import User from "@/models/User";
import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";


export async function POST(request) {
    try {
        const auth = getAuth(request);
        const userId = auth?.userId;

        const { address, items } = await request.json();
        await connectDB();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        if (!address|| !items || items.length === 0) {
            return NextResponse.json({ success: false, message: "Invalid order data" }, { status: 400 });
        }

        //calculate amount using items
        const amount = await items.reduce(async (acc, item) => {      
            const product = await Product.findById(item.product);
            return acc + (product.price * item.quantity);
        }, 0);
        
        //console.log("Calculated amount:", amount);

        await inngest.send({
            name: "order/created",
            data: {
            userId,   
            items,       
            amount: amount + Math.floor(amount * 0.02), // Add 2% tax to the total amount
            address,
            date: Date.now(),
            }
        })

        //clear cart after order is placed
        //const user= await User.findById(userId);
        const user = await User.findOne({ _id: userId });
        user.cartItems = [];
        await user.save();

        return NextResponse.json({ success: true, message: "Order Placed Successfully" }, { status: 201 });
        
} catch (error) {
        console.log("Error creating order:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 } );
}
}